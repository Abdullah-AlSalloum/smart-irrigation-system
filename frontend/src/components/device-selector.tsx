"use client";

import styles from "./device-selector.module.css";

interface Device {
  id: string;
  name: string;
  location?: string;
}

interface DeviceSelectorProps {
  devices: Device[];
  selectedDeviceId: string;
  onDeviceChange: (deviceId: string) => void;
  isLoading: boolean;
}

export function DeviceSelector({
  devices,
  selectedDeviceId,
  onDeviceChange,
  isLoading,
}: DeviceSelectorProps) {
  return (
    <div className={styles.selector}>
      <h3>Cihazlar</h3>
      <div className={styles.deviceList}>
        {isLoading ? (
          <p className={styles.loading}>Yükleniyor...</p>
        ) : devices.length === 0 ? (
          <p className={styles.empty}>Cihaz bulunamadı</p>
        ) : (
          devices.map((device) => (
            <button
              key={device.id}
              className={`${styles.deviceItem} ${
                selectedDeviceId === device.id ? styles.active : ""
              }`}
              onClick={() => onDeviceChange(device.id)}
            >
              <div className={styles.deviceName}>{device.name}</div>
              {device.location && (
                <div className={styles.deviceLocation}>{device.location}</div>
              )}
              {selectedDeviceId === device.id && (
                <div className={styles.indicator}>✓ Seçili</div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
