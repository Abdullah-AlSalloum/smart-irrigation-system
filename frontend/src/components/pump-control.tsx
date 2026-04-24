"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

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

  const handlePumpToggle = () => {
    if (pumpStatus === "ON") {
      onControlChange?.("off");
      return;
    }
    onControlChange?.("on");
  };

  const effectiveStatus = manualMode ? pumpStatus : "AUTO";
  const statusText =
    effectiveStatus === "ON" ? "AÇIK" : effectiveStatus === "OFF" ? "KAPALI" : "OTOMATİK";

  const lightClass =
    effectiveStatus === "ON"
      ? "bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.7)]"
      : effectiveStatus === "OFF"
        ? "bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.7)]"
        : "bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.7)]";

  const statusPillClass =
    effectiveStatus === "ON"
      ? "border-emerald-400/30 bg-emerald-500/12 text-emerald-300"
      : effectiveStatus === "OFF"
        ? "border-rose-400/30 bg-rose-500/12 text-rose-300"
        : "border-sky-400/30 bg-sky-500/12 text-sky-300";

  const cannotControl = isLoading || !manualMode || !deviceId || deviceId === "N/A";

  return (
    <Card
      title="Pompa Kontrolü"
      subtitle="Manuel moda geçerek pompayı tek dokunuşla yönetin"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full ${lightClass} ${effectiveStatus !== "OFF" ? "animate-pulse" : ""}`} />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Durum</span>
          </div>
          <span className={["rounded-full border px-3 py-1 text-xs font-bold tracking-wider", statusPillClass].join(" ")}>
            {statusText}
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-300">Manuel mod</p>
            <button
              type="button"
              onClick={() => setManualMode((c) => !c)}
              disabled={isLoading}
              aria-pressed={manualMode}
              className={[
                "relative h-6 w-11 rounded-full border transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                manualMode ? "border-sky-400/60 bg-sky-500" : "border-slate-600 bg-slate-700",
                isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                  manualMode ? "translate-x-5" : "translate-x-0",
                ].join(" ")}
              />
            </button>
          </div>
          <p className="text-xs text-slate-400">
            {manualMode
              ? "Pompa kontrolü sizde. Aşağıdaki anahtarla açıp kapatabilirsiniz."
              : "Otomatik kontrol aktif. Sistem sensör verilerine göre karar verir."}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
          <button
            type="button"
            onClick={handlePumpToggle}
            disabled={cannotControl}
            className={[
              "group w-full rounded-xl border px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
              pumpStatus === "ON"
                ? "border-rose-400/40 bg-rose-500/12 text-rose-300 hover:bg-rose-500/20"
                : "border-emerald-400/40 bg-emerald-500/12 text-emerald-300 hover:bg-emerald-500/20",
              cannotControl ? "cursor-not-allowed opacity-55" : "cursor-pointer hover:-translate-y-0.5",
            ].join(" ")}
          >
            {pumpStatus === "ON" ? "Pompayı Kapat" : "Pompayı Aç"}
          </button>
          <p className="mt-2 text-center text-xs text-slate-500">Kontrol sadece manuel modda aktif olur.</p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {errorMessage}
          </div>
        )}

        {(lastReason || lastAction) && (
          <div className="grid gap-1 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-400">
            {lastReason && <div>Son neden: {lastReason}</div>}
            {lastAction && (
              <div>Son aksiyon: {new Date(lastAction).toLocaleString("tr-TR")}</div>
            )}
          </div>
        )}

        <div className="border-t border-white/10 pt-3 text-center text-xs text-slate-500">
          <small>Cihaz: {deviceId}</small>
        </div>
      </div>
    </Card>
  );
}

export { PumpControlPanel as PumpControl };
