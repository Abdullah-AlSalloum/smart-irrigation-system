"use client";

import { useState } from "react";
import styles from "./pump-control.module.css";

interface PumpControlPanelProps {
  deviceId: string;
  onControlChange?: (action: "on" | "off") => void;
  isLoading?: boolean;
}

export function PumpControlPanel({
  deviceId,
  onControlChange,
  isLoading = false,
}: PumpControlPanelProps) {
  const [pumpStatus, setPumpStatus] = useState<"off" | "on" | "auto">("off");
  const [manualMode, setManualMode] = useState(false);

  const handlePumpOn = () => {
    setPumpStatus("on");
    onControlChange?.("on");
  };

  const handlePumpOff = () => {
    setPumpStatus("off");
    onControlChange?.("off");
  };

  const handleAutoMode = () => {
    setManualMode(!manualMode);
    setPumpStatus(manualMode ? "off" : "auto");
  };

  const statusColor =
    pumpStatus === "on" ? "green" : pumpStatus === "off" ? "red" : "blue";
  const statusText =
    pumpStatus === "on"
      ? "AÇIK"
      : pumpStatus === "off"
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
              pumpStatus === "on" ? styles.active : ""
            }`}
            onClick={handlePumpOn}
            disabled={isLoading || manualMode === false}
          >
            🟢 Aç
          </button>
          <button
            className={`${styles.button} ${styles.off} ${
              pumpStatus === "off" ? styles.active : ""
            }`}
            onClick={handlePumpOff}
            disabled={isLoading || manualMode === false}
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
        </div>

        <div className={styles.deviceInfo}>
          <small>Cihaz: {deviceId}</small>
        </div>
      </div>
    </div>
  );
}
