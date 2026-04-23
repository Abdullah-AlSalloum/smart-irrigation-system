"use client";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

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
    <Card
      title="Cihazlar"
      subtitle="Canlı veri almak için bir cihaz seçin"
      className="h-fit"
    >
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="grid min-h-36 place-items-center text-sm text-slate-400">Cihazlar yükleniyor...</div>
        ) : devices.length === 0 ? (
          <EmptyState
            icon="leaf"
            title="Cihaz bulunamadı"
            description="Yeni bir cihaz eklendiğinde bu listede görünecek."
            className="min-h-36"
          />
        ) : (
          devices.map((device) => {
            const isActive = selectedDeviceId === device.id;
            return (
              <button
                key={device.id}
                onClick={() => onDeviceChange(device.id)}
                className={[
                  "group rounded-xl border px-4 py-3 text-left text-sm text-slate-100",
                  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                  isActive
                    ? "border-sky-400/70 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]"
                    : "border-white/10 bg-slate-950/50 hover:border-slate-500/80 hover:bg-slate-900/80",
                ].join(" ")}
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="font-semibold tracking-tight">{device.name}</span>
                  <span
                    className={[
                      "h-2.5 w-2.5 rounded-full transition-all duration-200",
                      isActive ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" : "bg-slate-600",
                    ].join(" ")}
                  />
                </div>
                {device.location && (
                  <div className="text-xs text-slate-400">{device.location}</div>
                )}
                {isActive && (
                  <div className="mt-2 text-xs font-semibold text-sky-300">Aktif cihaz</div>
                )}
              </button>
            );
          })
        )}
      </div>
    </Card>
  );
}

export { DeviceSelector as DeviceList };
