"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./sensor-chart-panel.module.css";

export interface SensorChartPoint {
  createdAt: string;
  timeLabel: string;
  moisture: number;
  temperature: number;
  ph: number;
}

interface SensorChartPanelProps {
  points: SensorChartPoint[];
  loading: boolean;
  selectedHours: number;
  onHoursChange: (hours: number) => void;
}

const PERIODS = [6, 12, 24, 48];

export function SensorChartPanel({
  points,
  loading,
  selectedHours,
  onHoursChange,
}: SensorChartPanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <h2>Sensör Geçmişi</h2>
        <div className={styles.periods}>
          {PERIODS.map((hours) => (
            <button
              key={hours}
              type="button"
              className={`${styles.periodButton} ${selectedHours === hours ? styles.periodActive : ""}`}
              onClick={() => onHoursChange(hours)}
            >
              {hours}s
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}>Grafik verisi yükleniyor...</div>
      ) : points.length === 0 ? (
        <div className={styles.empty}>Seçili cihaz için sensör geçmişi bulunamadı.</div>
      ) : (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={points} margin={{ top: 8, right: 12, left: 2, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(125, 211, 252, 0.12)" />
              <XAxis dataKey="timeLabel" stroke="#9fb5c7" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" stroke="#9fb5c7" tick={{ fontSize: 12 }} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" stroke="#9fb5c7" tick={{ fontSize: 12 }} domain={[0, 50]} />
              <Tooltip
                contentStyle={{
                  background: "rgba(7, 17, 28, 0.92)",
                  border: "1px solid rgba(125, 211, 252, 0.28)",
                  borderRadius: "10px",
                }}
                labelStyle={{ color: "#bfdbfe" }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="moisture"
                stroke="#22d3ee"
                name="Nem (%)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temperature"
                stroke="#fb923c"
                name="Sıcaklık (°C)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ph"
                stroke="#a78bfa"
                name="pH"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
