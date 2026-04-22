"use client";

import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import styles from "./page.module.css";
import { registerUser } from "@/lib/api-client";
import { clearStoredToken, getStoredToken, loginAndStoreToken } from "@/lib/auth-service";
import { createDevice, fetchDevices } from "@/lib/protected-api-client";
import { createSensorSocket, getSocketBaseUrl } from "@/lib/socket-client";
import { StatusCard } from "@/components/status-card";

export default function Home() {
  const socketRef = useRef<Socket | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [createDeviceLoading, setCreateDeviceLoading] = useState(false);
  const [registerResult, setRegisterResult] = useState<string>("Not tested");
  const [loginResult, setLoginResult] = useState<string>("Not tested");
  const [deviceResult, setDeviceResult] = useState<string>("Not tested");
  const [createDeviceResult, setCreateDeviceResult] = useState<string>("Not tested");
  const [tokenState, setTokenState] = useState<string>("Not stored");
  const [testEmail, setTestEmail] = useState<string>("step2test@example.com");
  const [lastEmail, setLastEmail] = useState<string>("-");
  const [deviceName, setDeviceName] = useState<string>("Step2 Test Device");
  const [deviceId, setDeviceId] = useState<string>("");
  const [socketState, setSocketState] = useState<string>("Not connected");
  const [eventLog, setEventLog] = useState<string[]>([]);

  function pushEventLog(message: string) {
    setEventLog((current) => [`${new Date().toLocaleTimeString()} | ${message}`, ...current].slice(0, 8));
  }

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  async function testRegister() {
    try {
      setRegisterLoading(true);
      const response = await registerUser({
        email: testEmail,
        name: "Step2 Test",
        password: "password123",
      });
      setRegisterResult(`OK: ${response.user.email}`);
      setLastEmail(response.user.email);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setRegisterResult(`ERROR: ${message}`);
    } finally {
      setRegisterLoading(false);
    }
  }

  async function testLoginAndStoreToken() {
    try {
      setLoginLoading(true);
      const token = await loginAndStoreToken({
        email: testEmail,
        password: "password123",
      });
      setLoginResult(`OK: token length ${token.length}`);
      setTokenState(getStoredToken() ? "Stored" : "Not stored");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setLoginResult(`ERROR: ${message}`);
      setTokenState(getStoredToken() ? "Stored" : "Not stored");
    } finally {
      setLoginLoading(false);
    }
  }

  function clearToken() {
    clearStoredToken();
    setTokenState("Not stored");
  }

  async function testFetchDevices() {
    try {
      setDeviceLoading(true);
      setTokenState(getStoredToken() ? "Stored" : "Not stored");
      const response = await fetchDevices();
      if (response.error) {
        setDeviceResult(`ERROR: ${response.error}`);
      } else if (response.data) {
        const count = response.data.length;
        const firstDeviceId = response.data[0]?.id ?? "";
        if (firstDeviceId) {
          setDeviceId(firstDeviceId);
        }
        setDeviceResult(firstDeviceId ? `OK: ${count} cihaz | ilk cihaz hazır` : `OK: ${count} cihaz`);
      } else {
        setDeviceResult("OK: No data");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setDeviceResult(`ERROR: ${message}`);
    } finally {
      setDeviceLoading(false);
    }
  }

  async function testCreateDevice() {
    try {
      setCreateDeviceLoading(true);
      setTokenState(getStoredToken() ? "Stored" : "Not stored");

      const response = await createDevice({
        name: deviceName,
      });

      if (response.error) {
        setCreateDeviceResult(`ERROR: ${response.error}`);
        return;
      }

      const createdDevice = response.data;

      if (!createdDevice) {
        setCreateDeviceResult("ERROR: Cihaz olusturulamadi");
        return;
      }

      setDeviceId(createdDevice.id);
      setCreateDeviceResult(`OK: ${createdDevice.name}`);
      pushEventLog(`Test cihazi olusturuldu: ${createdDevice.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setCreateDeviceResult(`ERROR: ${message}`);
    } finally {
      setCreateDeviceLoading(false);
    }
  }

  function connectSocket() {
    if (socketRef.current?.connected) {
      setSocketState("Connected");
      pushEventLog("Socket zaten bagli");
      return;
    }

    const socket = createSensorSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketState("Connected");
      pushEventLog(`Socket baglandi (${socket.id ?? "unknown"})`);
    });

    socket.on("disconnect", () => {
      setSocketState("Disconnected");
      pushEventLog("Socket baglantisi kapandi");
    });

    socket.on("connect_error", (error) => {
      setSocketState("Error");
      pushEventLog(`Baglanti hatasi: ${error.message}`);
    });

    socket.on("subscribed", (payload: { deviceId: string }) => {
      setSocketState("Subscribed");
      pushEventLog(`Cihaz aboneligi aktif: ${payload.deviceId}`);
    });

    socket.on("sensor-data", (payload: { deviceId: string; moisture: number; temperature: number; ph: number }) => {
      pushEventLog(
        `Sensor ${payload.deviceId}: nem ${payload.moisture}, isi ${payload.temperature}, ph ${payload.ph}`,
      );
    });

    socket.on("pump-status", (payload: { deviceId: string; status: string }) => {
      pushEventLog(`Pompa ${payload.deviceId}: ${payload.status}`);
    });

    socket.on("alert", (payload: { deviceId: string; message: string; severity: string }) => {
      pushEventLog(`Uyari ${payload.deviceId}: ${payload.severity} - ${payload.message}`);
    });

    socket.connect();
    setSocketState("Connecting");
  }

  function subscribeDevice() {
    const socket = socketRef.current;

    if (!socket?.connected) {
      pushEventLog("Abonelik icin once socket baglantisi gerekli");
      return;
    }

    if (!deviceId.trim()) {
      pushEventLog("Abonelik icin device id gerekli");
      return;
    }

    socket.emit("subscribe", { deviceId: deviceId.trim() });
    pushEventLog(`Abonelik istegi gonderildi: ${deviceId.trim()}`);
  }

  function disconnectSocket() {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSocketState("Disconnected");
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Frontend Step 2.5</h1>
        <p>Minimal protected API client + websocket event log</p>

        <input
          value={testEmail}
          onChange={(event) => setTestEmail(event.target.value)}
          placeholder="test email"
          style={{
            width: "100%",
            maxWidth: 360,
            border: "1px solid var(--button-secondary-border)",
            borderRadius: 12,
            padding: "10px 12px",
            background: "transparent",
            color: "var(--text-primary)",
          }}
        />

        <input
          value={deviceId}
          onChange={(event) => setDeviceId(event.target.value)}
          placeholder="device id"
          style={{
            width: "100%",
            maxWidth: 360,
            border: "1px solid var(--button-secondary-border)",
            borderRadius: 12,
            padding: "10px 12px",
            background: "transparent",
            color: "var(--text-primary)",
          }}
        />

        <input
          value={deviceName}
          onChange={(event) => setDeviceName(event.target.value)}
          placeholder="device name"
          style={{
            width: "100%",
            maxWidth: 360,
            border: "1px solid var(--button-secondary-border)",
            borderRadius: 12,
            padding: "10px 12px",
            background: "transparent",
            color: "var(--text-primary)",
          }}
        />

        <div className={styles.row}>
          <button className={styles.button} onClick={testRegister} disabled={registerLoading}>
            {registerLoading ? "Registering..." : "1) Test Register"}
          </button>
          <button className={styles.button} onClick={testLoginAndStoreToken} disabled={loginLoading}>
            {loginLoading ? "Logging in..." : "2) Test Login + Store Token"}
          </button>
          <button className={styles.button} onClick={testFetchDevices} disabled={deviceLoading}>
            {deviceLoading ? "Fetching..." : "3) Fetch Devices"}
          </button>
          <button className={styles.button} onClick={testCreateDevice} disabled={createDeviceLoading}>
            {createDeviceLoading ? "Creating..." : "4) Create Device"}
          </button>
          <button className={styles.secondaryButton} onClick={clearToken}>
            Clear Token
          </button>
          <button className={styles.button} onClick={connectSocket}>
            5) Connect Socket
          </button>
          <button className={styles.button} onClick={subscribeDevice}>
            6) Subscribe Device
          </button>
          <button className={styles.secondaryButton} onClick={disconnectSocket}>
            Disconnect Socket
          </button>
        </div>

        <div className={styles.cards}>
          <StatusCard
            label="Register Result"
            value={registerResult}
            tone={registerResult.startsWith("OK") ? "ok" : registerResult.startsWith("ERROR") ? "error" : "neutral"}
          />
          <StatusCard
            label="Login Result"
            value={loginResult}
            tone={loginResult.startsWith("OK") ? "ok" : loginResult.startsWith("ERROR") ? "error" : "neutral"}
          />
          <StatusCard label="Token State" value={tokenState} tone={tokenState === "Stored" ? "ok" : "neutral"} />
          <StatusCard label="Last Registered Email" value={lastEmail} />
          <StatusCard
            label="Device Fetch Result"
            value={deviceResult}
            tone={deviceResult.startsWith("OK") ? "ok" : deviceResult.startsWith("ERROR") ? "error" : "neutral"}
          />
          <StatusCard
            label="Create Device Result"
            value={createDeviceResult}
            tone={createDeviceResult.startsWith("OK") ? "ok" : createDeviceResult.startsWith("ERROR") ? "error" : "neutral"}
          />
          <StatusCard
            label="Socket State"
            value={socketState}
            tone={socketState === "Subscribed" || socketState === "Connected" ? "ok" : socketState === "Error" ? "error" : "neutral"}
          />
          <StatusCard label="Socket URL" value={getSocketBaseUrl()} />
          <StatusCard label="Selected Device" value={deviceId || "-"} />
        </div>

        <section className={styles.logPanel}>
          <div className={styles.logHeader}>Live Event Log</div>
          {eventLog.length === 0 ? (
            <div className={styles.logEmpty}>Henüz event yok. Socket baglanip device aboneligi yapin.</div>
          ) : (
            <div className={styles.logList}>
              {eventLog.map((entry) => (
                <div key={entry} className={styles.logItem}>
                  {entry}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
