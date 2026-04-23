"use client";

import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

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

function moistureLabel(value: number): string {
  if (value < 30) return "Kritik düşük seviye";
  if (value < 60) return "Dengeli sulama aralığı";
  return "Yüksek nem seviyesi";
}

function temperatureLabel(value: number): string {
  if (value < 10) return "Soğuk koşul";
  if (value < 25) return "İdeal sıcaklık";
  if (value < 35) return "Yüksek sıcaklık";
  return "Aşırı sıcak";
}

function phLabel(value: number): string {
  if (value < 6.5) return "Asidik bölge";
  if (value <= 7.5) return "Optimal pH";
  return "Bazik bölge";
}

export function SensorPanel({ data, isLoading }: SensorPanelProps) {
  return (
    <Card
      title="Sensör Verileri"
      subtitle="Anlık ölçümler otomatik olarak güncellenir"
    >

      {isLoading ? (
        <div className="grid min-h-44 place-items-center text-sm text-slate-400">Sensör verileri yükleniyor...</div>
      ) : !data ? (
        <EmptyState
          icon="sensor"
          title="Sensör verisi henüz gelmedi"
          description="Cihaz bağlantısı kurulduğunda nem, sıcaklık ve pH değerleri burada görünecek."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Nem"
            value={`${data.moisture.toFixed(1)}%`}
            tone="green"
            helper={moistureLabel(data.moisture)}
          />
          <StatCard
            label="Sıcaklık"
            value={`${data.temperature.toFixed(1)}°C`}
            tone="blue"
            helper={temperatureLabel(data.temperature)}
          />
          <StatCard
            label="pH"
            value={data.ph.toFixed(1)}
            tone="amber"
            helper={phLabel(data.ph)}
          />
        </div>
      )}

      {data?.timestamp && (
        <div className="mt-5 border-t border-white/10 pt-3 text-right text-xs text-slate-400">
          Son güncelleme: {new Date(data.timestamp).toLocaleTimeString("tr-TR")}
        </div>
      )}
    </Card>
  );
}
