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
import { ChartCard } from "@/components/chart-card";
import { EmptyState } from "@/components/ui/empty-state";

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
    <ChartCard
      title="Sensör Geçmişi"
      subtitle="Nem, sıcaklık ve pH eğrilerini birlikte izleyin"
      action={
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((hours) => (
            <button
              key={hours}
              type="button"
              onClick={() => onHoursChange(hours)}
              className={[
                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                selectedHours === hours
                  ? "border-sky-300/50 bg-sky-500/20 text-slate-50"
                  : "border-white/10 bg-slate-950/70 text-slate-400 hover:border-sky-300/40 hover:text-slate-100",
              ].join(" ")}
            >
              {hours}s
            </button>
          ))}
        </div>
      }
    >

      {loading ? (
        <div className="grid h-full place-items-center text-center text-sm text-slate-400">
          Grafik verisi yükleniyor...
        </div>
      ) : points.length === 0 ? (
        <EmptyState
          icon="chart"
          title="Grafik verisi bulunamadı"
          description="Seçili zaman aralığında sensör geçmişi geldiğinde çizimler burada görüntülenecek."
          className="h-full min-h-0"
        />
      ) : (
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 5" stroke="rgba(148,163,184,0.2)" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#94A3B8" tick={{ fontSize: 12 }} tickMargin={8} />
              <YAxis yAxisId="left" stroke="#94A3B8" tick={{ fontSize: 12 }} domain={[0, 100]} tickMargin={6} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#94A3B8"
                tick={{ fontSize: 12 }}
                domain={[0, 50]}
                tickMargin={6}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.95)",
                  border: "1px solid rgba(148,163,184,0.25)",
                  borderRadius: "12px",
                }}
                labelStyle={{ color: "#F8FAFC", fontWeight: 600 }}
                itemStyle={{ color: "#E2E8F0" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#CBD5E1", paddingTop: "8px" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="moisture"
                stroke="#34D399"
                name="Nem (%)"
                strokeWidth={2.6}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#34D399" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temperature"
                stroke="#38BDF8"
                name="Sıcaklık (°C)"
                strokeWidth={2.4}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#38BDF8" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ph"
                stroke="#FBBF24"
                name="pH"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#FBBF24" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

