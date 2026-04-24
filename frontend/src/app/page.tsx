"use client";

import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { registerUser } from "@/lib/api-client";
import { clearStoredToken, getStoredToken, loginAndStoreToken } from "@/lib/auth-service";
import {
  createDevice,
  deleteDevice,
  emitTestSensorData,
  fetchAlerts,
  fetchDevices,
  fetchPumpStatus,
  fetchSensorHistory,
  markAlertRead,
  markAllAlertsRead,
  setUnauthorizedHandler,
  turnPumpOff,
  turnPumpOn,
  type Alert,
  type PumpStatusResponse,
} from "@/lib/protected-api-client";
import { createSensorSocket } from "@/lib/socket-client";
import AlertPanel from "@/components/alert-panel";
import { DeviceList } from "@/components/device-selector";
import { PumpControl } from "@/components/pump-control";
import { SensorChartPanel, type SensorChartPoint } from "@/components/sensor-chart-panel";
import { SensorPanel } from "@/components/sensor-panel";

interface Device {
  id: string;
  name: string;
  location?: string;
}

interface SensorData {
  moisture: number;
  temperature: number;
  ph: number;
  timestamp?: string;
}

export default function Dashboard() {
  const socketRef = useRef<Socket | null>(null);
  const selectedDeviceIdRef = useRef<string>("");

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [currentSensorData, setCurrentSensorData] = useState<SensorData | null>(null);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const [chartHours, setChartHours] = useState(24);
  const [chartLoading, setChartLoading] = useState(false);
  const [sensorHistory, setSensorHistory] = useState<SensorChartPoint[]>([]);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  const [pumpLoading, setPumpLoading] = useState(false);
  const [pumpError, setPumpError] = useState("");
  const [pumpStatus, setPumpStatus] = useState<PumpStatusResponse>({
    deviceId: "",
    status: "OFF",
    lastAction: "",
    lastReason: "",
  });

  useEffect(() => {
    if (isLoggedIn) {
      void loadDevices();
      connectToSocket();
    }
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setIsLoggedIn(true); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      handleLogout();
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    selectedDeviceIdRef.current = selectedDeviceId;
    if (selectedDeviceId && socketRef.current?.connected) {
      socketRef.current.emit("subscribe", { deviceId: selectedDeviceId });
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    if (isLoggedIn && selectedDeviceId) {
      void loadSensorHistory(selectedDeviceId, chartHours);
      void loadPumpStatus(selectedDeviceId);
      void loadAlerts(selectedDeviceId);
    }
  }, [chartHours, isLoggedIn, selectedDeviceId]);

  async function loadDevices() {
    try {
      setDevicesLoading(true);
      const response = await fetchDevices();
      if (response.error) {
        console.error("Failed to fetch devices:", response.error);
        return;
      }

      const nextDevices = response.data ?? [];
      setDevices(nextDevices);

      if (nextDevices.length === 0) {
        setSelectedDeviceId("");
        setCurrentSensorData(null);
        setSensorHistory([]);
        setAlerts([]);
        setPumpStatus({
          deviceId: "",
          status: "OFF",
          lastAction: "",
          lastReason: "",
        });
        return;
      }

      const selectedStillExists = nextDevices.some((device) => device.id === selectedDeviceId);
      if (!selectedDeviceId || !selectedStillExists) {
        setSelectedDeviceId(nextDevices[0].id);
      }
    } catch (error) {
      console.error("Error loading devices:", error);
    } finally {
      setDevicesLoading(false);
    }
  }

  async function loadSensorHistory(deviceId: string, hours: number) {
    try {
      setChartLoading(true);
      const limit = Math.max(12, hours * 2);
      const response = await fetchSensorHistory(deviceId, limit);

      if (response.error) {
        console.error("Failed to load sensor history:", response.error);
        setSensorHistory([]);
        return;
      }

      const items = (response.data ?? [])
        .slice()
        .reverse()
        .map((entry) => ({
          createdAt: entry.createdAt,
          timeLabel: new Date(entry.createdAt).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          moisture: entry.moisture,
          temperature: entry.temperature,
          ph: entry.ph,
        }));

      setSensorHistory(items);

      const latest = items[items.length - 1];
      if (latest) {
        setCurrentSensorData({
          moisture: latest.moisture,
          temperature: latest.temperature,
          ph: latest.ph,
          timestamp: latest.createdAt,
        });
      }
    } catch (error) {
      console.error("Error loading sensor history:", error);
      setSensorHistory([]);
    } finally {
      setChartLoading(false);
    }
  }

  async function loadAlerts(deviceId: string) {
    try {
      setAlertsLoading(true);
      const response = await fetchAlerts(deviceId, 50);
      if (response.data) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setAlertsLoading(false);
    }
  }

  async function handleMarkAlertRead(alertId: string) {
    await markAlertRead(alertId);
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)));
  }

  async function handleMarkAllAlertsRead() {
    if (!selectedDeviceId) return;
    await markAllAlertsRead(selectedDeviceId);
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  }

  async function loadPumpStatus(deviceId: string) {
    try {
      setPumpError("");
      const response = await fetchPumpStatus(deviceId);
      if (response.error) {
        setPumpError(response.error);
        return;
      }

      if (response.data) {
        setPumpStatus(response.data);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Pompa durumu alınamadı";
      setPumpError(message);
    }
  }

  const [testLoading, setTestLoading] = useState(false);
  const [testMessage, setTestMessage] = useState("");

  async function handleSendTestData() {
    if (!selectedDeviceId) return;
    try {
      setTestLoading(true);
      setTestMessage("");
      const response = await emitTestSensorData(selectedDeviceId);
      if (response.error) {
        setTestMessage("Hata: " + response.error);
      } else {
        setTestMessage("Test verisi gönderildi!");
        setTimeout(() => setTestMessage(""), 3000);
      }
    } catch {
      setTestMessage("Test verisi gönderilemedi.");
    } finally {
      setTestLoading(false);
    }
  }

  async function handlePumpControl(action: "on" | "off") {
    if (!selectedDeviceId) return;

    try {
      setPumpLoading(true);
      setPumpError("");

      const response = action === "on" ? await turnPumpOn(selectedDeviceId) : await turnPumpOff(selectedDeviceId);

      if (response.error) {
        setPumpError(response.error);
        return;
      }

      if (response.data) {
        setPumpStatus(response.data);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Pompa komutu gönderilemedi";
      setPumpError(message);
    } finally {
      setPumpLoading(false);
    }
  }

  function connectToSocket() {
    if (socketRef.current?.connected) {
      return;
    }

    const socket = createSensorSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      if (selectedDeviceId) {
        socket.emit("subscribe", { deviceId: selectedDeviceId });
      }
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("sensor-data", (payload: { deviceId: string; moisture: number; temperature: number; ph: number }) => {
      if (payload.deviceId === selectedDeviceIdRef.current) {
        const nowIso = new Date().toISOString();

        setCurrentSensorData({
          moisture: payload.moisture,
          temperature: payload.temperature,
          ph: payload.ph,
          timestamp: nowIso,
        });

        setSensorHistory((current) => {
          const nextPoint: SensorChartPoint = {
            createdAt: nowIso,
            timeLabel: new Date(nowIso).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            moisture: payload.moisture,
            temperature: payload.temperature,
            ph: payload.ph,
          };

          const maxPoints = Math.max(24, chartHours * 2);
          return [...current, nextPoint].slice(-maxPoints);
        });
      }
    });

    socket.on("pump-status", (payload: { deviceId: string; status: "ON" | "OFF"; lastAction?: string; lastReason?: string }) => {
      if (payload.deviceId === selectedDeviceIdRef.current) {
        setPumpStatus((current) => ({
          deviceId: payload.deviceId,
          status: payload.status,
          lastAction: payload.lastAction ?? current.lastAction,
          lastReason: payload.lastReason ?? current.lastReason,
        }));
      }
    });

    socket.on("alert", (payload: Alert) => {
      if (payload.deviceId === selectedDeviceIdRef.current) {
        setAlerts((prev) => [payload, ...prev].slice(0, 50));
      }
    });

    socket.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error);
    });

    socket.connect();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoginLoading(true);
      setLoginError("");
      await loginAndStoreToken({ email: loginEmail, password: loginPassword });
      setIsLoggedIn(true);
      void loadDevices();
      connectToSocket();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Giriş başarısız";
      setLoginError(message);
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      setRegisterLoading(true);
      setRegisterError("");
      await registerUser({
        email: registerEmail,
        name: registerName,
        password: registerPassword,
      });

      setAuthMode("login");
      setLoginEmail(registerEmail);
      setLoginPassword(registerPassword);
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kayıt başarısız";
      setRegisterError(message);
    } finally {
      setRegisterLoading(false);
    }
  }

  function handleLogout() {
    clearStoredToken();
    setIsLoggedIn(false);
    socketRef.current?.disconnect();
    socketRef.current = null;
    setDevices([]);
    setSelectedDeviceId("");
    setCurrentSensorData(null);
    setSocketConnected(false);
    setPumpError("");
    setPumpStatus({
      deviceId: "",
      status: "OFF",
      lastAction: "",
      lastReason: "",
    });
    setAlerts([]);
  }

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050b18] text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.15),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(52,211,153,0.14),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(30,64,175,0.18),transparent_45%)]" />

        <main className="relative mx-auto grid min-h-screen w-[min(1140px,calc(100%-2rem))] place-items-center py-8">
          <div className="w-full max-w-[480px] rounded-3xl border border-white/15 bg-slate-950/75 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.6)] backdrop-blur-xl md:p-8">
            <div className="mb-6 space-y-1 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Smart Irrigation</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Akıllı Sulama Paneli</h1>
              <p className="text-sm text-slate-400">Cihazlarınızı güvenli şekilde yönetin ve canlı veriyi izleyin.</p>
            </div>

            <div className="relative mb-6 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-slate-900/80 p-1">
              <span
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 shadow-[0_8px_20px_rgba(37,99,235,0.35)]",
                  "transition-transform duration-300 ease-out",
                  authMode === "login" ? "translate-x-0" : "translate-x-[calc(100%+0.5rem)]",
                ].join(" ")}
              />
              {(["login", "register"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAuthMode(mode)}
                  className={[
                    "relative z-10 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                    authMode === mode ? "text-slate-50" : "text-slate-400 hover:text-slate-100",
                  ].join(" ")}
                >
                  {mode === "login" ? "Giriş" : "Kayıt"}
                </button>
              ))}
            </div>

            {authMode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="email"
                  placeholder="E-posta"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 focus:border-sky-400/60 focus:outline-none focus:ring-4 focus:ring-sky-500/20"
                />
                <input
                  type="password"
                  placeholder="Şifre"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 focus:border-sky-400/60 focus:outline-none focus:ring-4 focus:ring-sky-500/20"
                />
                {loginError && <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{loginError}</div>}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold tracking-wide text-slate-950 transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_10px_24px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loginLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <input
                  type="text"
                  placeholder="Ad Soyad"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 focus:border-sky-400/60 focus:outline-none focus:ring-4 focus:ring-sky-500/20"
                />
                <input
                  type="email"
                  placeholder="E-posta"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 focus:border-sky-400/60 focus:outline-none focus:ring-4 focus:ring-sky-500/20"
                />
                <input
                  type="password"
                  placeholder="Şifre"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 focus:border-sky-400/60 focus:outline-none focus:ring-4 focus:ring-sky-500/20"
                />
                {registerError && <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{registerError}</div>}
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold tracking-wide text-slate-950 transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_10px_24px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {registerLoading ? "Kayıt oluşturuluyor..." : "Kaydol"}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    );
  }

  const activeDeviceName = devices.find((d) => d.id === selectedDeviceId)?.name ?? "Cihaz seçilmedi";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050b18] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_5%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(52,211,153,0.1),transparent_30%),radial-gradient(circle_at_45%_100%,rgba(30,64,175,0.16),transparent_40%)]" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="relative mx-auto flex w-[min(1500px,calc(100%-2.5rem))] flex-wrap items-center gap-4 py-4 md:flex-nowrap">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 text-slate-950 shadow-[0_8px_24px_rgba(52,211,153,0.35)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.8 2 3 6.6 3 12a9 9 0 1 0 18 0c0-5.4-3.8-10-9-10z" />
              <path d="M12 21v-5" />
              <path d="m9 13 3-3 3 3" />
            </svg>
          </div>

          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-100 md:text-lg">Akıllı Sulama Sistemi</h1>
            <p className="text-xs text-slate-400">Canlı ölçüm, otomasyon ve alarm yönetimi</p>
          </div>

          <div className="h-7 w-px bg-white/10 max-md:hidden" />

          <div className="rounded-full border border-sky-300/30 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-slate-100">
            Aktif cihaz: <span className="font-semibold text-sky-200">{activeDeviceName}</span>
          </div>

          <div className="ml-auto flex items-center gap-3 pl-2">
            <div
              className={[
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                socketConnected
                  ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
                  : "border-rose-400/35 bg-rose-500/10 text-rose-200",
              ].join(" ")}
            >
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  socketConnected
                    ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                    : "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.9)]",
                ].join(" ")}
              />
              {socketConnected ? "Bağlı" : "Bağlı Değil"}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="jml-1 rounded-full border border-rose-400/40 bg-rose-500/10 px-11 py-1.5 text-xs font-semibold text-rose-100 transition-all duration-200 hover:bg-rose-500/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto grid w-[min(1500px,calc(100%-2rem))] grid-cols-1 gap-5 py-6 lg:grid-cols-[320px_minmax(0,1fr)_360px] xl:gap-6">
        <aside className="space-y-5">
          <DeviceList
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            onDeviceChange={setSelectedDeviceId}
            isLoading={devicesLoading}
            onAddDevice={async (name) => {
              const response = await createDevice({ name });
              if (response.error) throw new Error(response.error);
              await loadDevices();
              if (response.data) setSelectedDeviceId(response.data.id);
            }}
            onDeleteDevice={async (deviceId) => {
              const response = await deleteDevice(deviceId);
              if (response.error) throw new Error(response.error);
              if (selectedDeviceId === deviceId) setSelectedDeviceId("");
              await loadDevices();
            }}
          />
        </aside>

        <section className="space-y-5">
          <SensorPanel data={currentSensorData} isLoading={false} />

          {selectedDeviceId && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Fiziksel cihaz yok mu?</p>
                <p className="text-xs text-white/50">Rastgele sensör verisi üretip WebSocket güncellemesini test edin.</p>
              </div>
              <button
                onClick={handleSendTestData}
                disabled={testLoading}
                className="shrink-0 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-black transition-colors"
              >
                {testLoading ? "Gönderiliyor…" : "Test Verisi Gönder"}
              </button>
              {testMessage && (
                <span className="text-xs text-emerald-400">{testMessage}</span>
              )}
            </div>
          )}

          <SensorChartPanel
            points={sensorHistory}
            loading={chartLoading}
            selectedHours={chartHours}
            onHoursChange={setChartHours}
          />
        </section>

        <aside className="space-y-5">
          <PumpControl
            deviceId={selectedDeviceId || "N/A"}
            pumpStatus={pumpStatus.status}
            lastReason={pumpStatus.lastReason}
            lastAction={pumpStatus.lastAction}
            errorMessage={pumpError}
            isLoading={pumpLoading}
            onControlChange={handlePumpControl}
          />
          <AlertPanel
            alerts={alerts}
            isLoading={alertsLoading}
            onMarkRead={handleMarkAlertRead}
            onMarkAllRead={handleMarkAllAlertsRead}
          />
        </aside>
      </main>
    </div>
  );
}
