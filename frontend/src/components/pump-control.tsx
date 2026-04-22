"use client";

import { useState } from "react";
import styles from "./pump-control.module.css";

interface PumpControlPanelProps {
  deviceId: string;
  pumpStatus: "ON" | "OFF";
  lastReason?: string;
  lastAction?: string;
  errorMessage?: string;
  onControlChange?: (action: "on" | "off") => void;
  isLoading?: boolean;
}

export function PumpControlPanel({
  deviceId,
  pumpStatus,
  lastReason,
  lastAction,
  errorMessage,
  onControlChange,
  isLoading = false,
}: PumpControlPanelProps) {
  const [manualMode, setManualMode] = useState(false);

  const handlePumpOn = () => {
    onControlChange?.("on");
  };

  const handlePumpOff = () => {
    onControlChange?.("off");
  };

  const handleAutoMode = () => {
    setManualMode((current) => !current);
  };

  const effectiveStatus = manualMode ? pumpStatus : "AUTO";

  const statusColor =
    effectiveStatus === "ON"
      ? "green"
      : effectiveStatus === "OFF"
        ? "red"
        : "blue";
  const statusText =
    effectiveStatus === "ON"
      ? "AÇIK"
      : effectiveStatus === "OFF"
        ? "KAPALI"
        : "OTOMATİK";

  return (
    <div className={styles.panel}>
      <h2>Pompa Kontrolü</h2>
      <div className={styles.content}>
        <div className={styles.statusDisplay}>
          <div className={`${styles.statusLight} ${styles[statusColor]}`}></div>
          <span className={styles.statusText}>{statusText}</span>
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={`${styles.button} ${styles.on} ${
              pumpStatus === "ON" ? styles.active : ""
            }`}
            onClick={handlePumpOn}
            disabled={isLoading || !manualMode || !deviceId || deviceId === "N/A"}
          >
            🟢 Aç
          </button>
          <button
            className={`${styles.button} ${styles.off} ${
              pumpStatus === "OFF" ? styles.active : ""
            }`}
            onClick={handlePumpOff}
            disabled={isLoading || !manualMode || !deviceId || deviceId === "N/A"}
          >
            🔴 Kapat
          </button>
        </div>

        <div className={styles.autoModeSection}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={manualMode}
              onChange={handleAutoMode}
              disabled={isLoading}
            />
            <span>Manuel Mod</span>
          </label>
          {!manualMode && (
            <p className={styles.autoNote}>⚙️ Otomatik mod aktif - sistem yönetiyor</p>
          )}
          {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
        </div>

        {(lastReason || lastAction) && (
          <div className={styles.metaInfo}>
            {lastReason && <div>Son neden: {lastReason}</div>}
            {lastAction && <div>Son aksiyon: {new Date(lastAction).toLocaleString("tr-TR")}</div>}
          </div>
        )}

        <div className={styles.deviceInfo}>
          <small>Cihaz: {deviceId}</small>
        </div>
      </div>
    </div>
  );
}
