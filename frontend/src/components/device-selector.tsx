"use client";

import { useState } from "react";
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
  onAddDevice?: (name: string) => Promise<void>;
  onDeleteDevice?: (deviceId: string) => Promise<void>;
}

export function DeviceSelector({
  devices,
  selectedDeviceId,
  onDeviceChange,
  isLoading,
  onAddDevice,
  onDeleteDevice,
}: DeviceSelectorProps) {
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    setAddError("");
    try {
      await onAddDevice?.(newName.trim());
      setNewName("");
      setShowForm(false);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Cihaz eklenemedi");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(e: React.MouseEvent, deviceId: string) {
    e.stopPropagation();
    if (!confirm("Bu cihazı silmek istediğinizden emin misiniz?")) return;
    setDeletingId(deviceId);
    try {
      await onDeleteDevice?.(deviceId);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card
      title="Cihazlar"
      subtitle="Canlı veri almak için bir cihaz seçin"
      className="h-fit"
    >
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="grid min-h-36 place-items-center text-sm text-slate-400">Cihazlar yükleniyor...</div>
        ) : devices.length === 0 && !showForm ? (
          <EmptyState
            icon="leaf"
            title="Cihaz bulunamadı"
            description="Aşağıdaki butona tıklayarak ilk cihazınızı ekleyin."
            className="min-h-36"
          />
        ) : (
          devices.map((device) => {
            const isActive = selectedDeviceId === device.id;
            return (
              <div
                key={device.id}
                role="button"
                tabIndex={0}
                onClick={() => onDeviceChange(device.id)}
                onKeyDown={(e) => e.key === "Enter" && onDeviceChange(device.id)}
                className={[
                  "group cursor-pointer rounded-xl border px-4 py-3 text-left text-sm text-slate-100",
                  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                  isActive
                    ? "border-sky-400/70 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]"
                    : "border-white/10 bg-slate-950/50 hover:border-slate-500/80 hover:bg-slate-900/80",
                ].join(" ")}
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="font-semibold tracking-tight">{device.name}</span>
                  <div className="flex items-center gap-2">
                    {onDeleteDevice && (
                      <button
                        onClick={(e) => handleDelete(e, device.id)}
                        disabled={deletingId === device.id}
                        title="Cihazı sil"
                        className="rounded p-0.5 text-slate-500 hover:text-red-400 disabled:opacity-40 transition-colors"
                      >
                        {deletingId === device.id ? (
                          <span className="text-xs">…</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        )}
                      </button>
                    )}
                    <span
                      className={[
                        "h-2.5 w-2.5 rounded-full transition-all duration-200",
                        isActive ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" : "bg-slate-600",
                      ].join(" ")}
                    />
                  </div>
                </div>
                {device.location && (
                  <div className="text-xs text-slate-400">{device.location}</div>
                )}
                {isActive && (
                  <div className="mt-2 text-xs font-semibold text-sky-300">Aktif cihaz</div>
                )}
              </div>
            );
          })
        )}

        {showForm && (
          <div className="flex flex-col gap-2 rounded-xl border border-sky-400/30 bg-sky-500/5 p-3">
            <input
              type="text"
              placeholder="Cihaz adı (örn: Bahçe 1)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            />
            {addError && <p className="text-xs text-red-400">{addError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={adding || !newName.trim()}
                className="flex-1 rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-sky-400 disabled:opacity-50 transition-colors"
              >
                {adding ? "Ekleniyor…" : "Ekle"}
              </button>
              <button
                onClick={() => { setShowForm(false); setNewName(""); setAddError(""); }}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {onAddDevice && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-2.5 text-sm text-slate-400 hover:border-sky-400/50 hover:text-sky-300 transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Cihaz Ekle
          </button>
        )}
      </div>
    </Card>
  );
}

export { DeviceSelector as DeviceList };
