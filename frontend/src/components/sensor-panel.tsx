"use client";

import styles from "./sensor-panel.module.css";

interface SensorData {
  moisture: number;
  temperature: number;
  ph: number;
  timestamp?: string;
}

interface SensorPanelProps {
  data: SensorData | null;
  isLoading: boolean;
}

export function SensorPanel({ data, isLoading }: SensorPanelProps) {
  return (
    <div className={styles.panel}>
      <h2>Sensör Verileri</h2>
      {isLoading ? (
        <div className={styles.loading}>Veri yükleniyor...</div>
      ) : !data ? (
        <div className={styles.empty}>Henüz veri alınmadı</div>
      ) : (
        <div className={styles.sensorGrid}>
          <div className={styles.sensorCard}>
            <div className={styles.label}>Nem</div>
            <div className={styles.value}>{data.moisture.toFixed(1)}%</div>
            <div className={styles.status}>
              {data.moisture < 30
                ? "🔴 Düşük"
                : data.moisture < 60
                  ? "🟡 Normal"
                  : "🟢 Yüksek"}
            </div>
          </div>

          <div className={styles.sensorCard}>
            <div className={styles.label}>Sıcaklık</div>
            <div className={styles.value}>{data.temperature.toFixed(1)}°C</div>
            <div className={styles.status}>
              {data.temperature < 10
                ? "❄️ Soğuk"
                : data.temperature < 25
                  ? "🟢 İyi"
                  : data.temperature < 35
                    ? "🟡 Sıcak"
                    : "🔴 Çok Sıcak"}
            </div>
          </div>

          <div className={styles.sensorCard}>
            <div className={styles.label}>pH</div>
            <div className={styles.value}>{data.ph.toFixed(1)}</div>
            <div className={styles.status}>
              {data.ph < 6.5
                ? "🔴 Asidik"
                : data.ph < 7.5
                  ? "🟢 Optimal"
                  : "🟡 Bazik"}
            </div>
          </div>
        </div>
      )}
      {data?.timestamp && (
        <div className={styles.timestamp}>
          Son güncelleme: {new Date(data.timestamp).toLocaleTimeString("tr-TR")}
        </div>
      )}
    </div>
  );
}
