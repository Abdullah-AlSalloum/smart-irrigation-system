"use client";

import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import styles from "./dashboard.module.css";
import { registerUser } from "@/lib/api-client";
import { clearStoredToken, getStoredToken, loginAndStoreToken } from "@/lib/auth-service";
import { fetchDevices } from "@/lib/protected-api-client";
import { createSensorSocket } from "@/lib/socket-client";
import { DeviceSelector } from "@/components/device-selector";
import { SensorPanel } from "@/components/sensor-panel";
import { PumpControlPanel } from "@/components/pump-control";

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
  
  // Auth mode: login or register
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  
  // Always start with false to match server render
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  // Dashboard state
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [currentSensorData, setCurrentSensorData] = useState<SensorData | null>(null);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);


  // Load devices and connect socket on mount if logged in
  useEffect(() => {
    if (isLoggedIn) {
      void loadDevices();
      connectToSocket();
    }
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check token on client mount only (after hydration)
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setIsLoggedIn(true); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, []);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Auto-subscribe to device when selected
  useEffect(() => {
    if (selectedDeviceId && socketRef.current?.connected) {
      socketRef.current.emit("subscribe", { deviceId: selectedDeviceId });
    }
  }, [selectedDeviceId]);

  async function loadDevices() {
    try {
      setDevicesLoading(true);
      const response = await fetchDevices();
      if (response.error) {
        console.error("Failed to fetch devices:", response.error);
        return;
      }
      if (response.data && response.data.length > 0) {
        setDevices(response.data);
        if (!selectedDeviceId) {
          setSelectedDeviceId(response.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading devices:", error);
    } finally {
      setDevicesLoading(false);
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
      if (payload.deviceId === selectedDeviceId) {
        setCurrentSensorData({
          moisture: payload.moisture,
          temperature: payload.temperature,
          ph: payload.ph,
          timestamp: new Date().toISOString(),
        });
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
      await loginAndStoreToken({
        email: loginEmail,
        password: loginPassword,
      });
      setIsLoggedIn(true);
      loadDevices();
      connectToSocket();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
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
      
      // Switch to login after successful registration
      setAuthMode("login");
      setLoginEmail(registerEmail);
      setLoginPassword(registerPassword);
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
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
  }

  // Login/Register screen
  if (!isLoggedIn) {
    return (
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <h1>Akıllı Sulama Sistemi</h1>
          
          {/* Tab Buttons */}
          <div className={styles.tabButtons}>
            <button
              className={`${styles.tabButton} ${authMode === "login" ? styles.active : ""}`}
              onClick={() => setAuthMode("login")}
              type="button"
            >
              Giriş Yap
            </button>
            <button
              className={`${styles.tabButton} ${authMode === "register" ? styles.active : ""}`}
              onClick={() => setAuthMode("register")}
              type="button"
            >
              Kaydol
            </button>
          </div>

          {/* Login Form */}
          {authMode === "login" && (
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="E-posta"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className={styles.input}
              />
              <input
                type="password"
                placeholder="Şifre"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className={styles.input}
              />
              {loginError && <div className={styles.error}>{loginError}</div>}
              <button type="submit" disabled={loginLoading} className={styles.primaryButton}>
                {loginLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {authMode === "register" && (
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Ad Soyad"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
                className={styles.input}
              />
              <input
                type="email"
                placeholder="E-posta"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                className={styles.input}
              />
              <input
                type="password"
                placeholder="Şifre"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                className={styles.input}
              />
              {registerError && <div className={styles.error}>{registerError}</div>}
              <button type="submit" disabled={registerLoading} className={styles.primaryButton}>
                {registerLoading ? "Kaydediliyor..." : "Kaydol"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }
  // Dashboard screen
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Akıllı Sulama Sistemi</h1>
          <span className={`${styles.socketStatus} ${socketConnected ? styles.connected : ""}`}>
            {socketConnected ? "🟢 Bağlı" : "🔴 Bağlı Değil"}
          </span>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Çıkış Yap
        </button>
      </header>

      <div className={styles.dashboard}>
        <aside className={styles.sidebar}>
          <DeviceSelector
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            onDeviceChange={setSelectedDeviceId}
            isLoading={devicesLoading}
          />
        </aside>

        <main className={styles.mainContent}>
          <SensorPanel data={currentSensorData} isLoading={false} />
        </main>

        <aside className={styles.sidebar}>
          <PumpControlPanel deviceId={selectedDeviceId || "N/A"} />
        </aside>
      </div>
    </div>
  );
}
