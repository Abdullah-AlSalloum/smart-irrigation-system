'use client';

import { Alert } from '@/lib/protected-api-client';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

interface AlertPanelProps {
  alerts: Alert[];
  isLoading: boolean;
  onMarkRead: (alertId: string) => void;
  onMarkAllRead: () => void;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function typeLabel(type: string): string {
  switch (type) {
    case 'ph': return 'pH';
    case 'temperature': return 'Sıcaklık';
    case 'moisture': return 'Nem';
    default: return type;
  }
}

const severityBorderClass: Record<string, string> = {
  critical: 'border-l-[3px] border-l-[#EF4444]',
  warning: 'border-l-[3px] border-l-[#F59E0B]',
  info: 'border-l-[3px] border-l-[#3B82F6]',
};

const severityBadgeClass: Record<string, string> = {
  critical: 'bg-[#EF4444] text-[#F1F5F9]',
  warning: 'bg-[#F59E0B] text-[#0F172A]',
  info: 'bg-[#3B82F6] text-[#F1F5F9]',
};

const severityLabel: Record<string, string> = {
  critical: 'Kritik',
  warning: 'Uyarı',
  info: 'Bilgi',
};

export default function AlertPanel({ alerts, isLoading, onMarkRead, onMarkAllRead }: AlertPanelProps) {
  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <Card
      title="Uyarılar"
      subtitle={unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
      className="max-h-[560px]"
      action={
        unreadCount > 0 ? (
          <button
            onClick={onMarkAllRead}
            className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all duration-200 hover:border-sky-300/40 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Tümünü okundu yap
          </button>
        ) : null
      }
    >

      {isLoading ? (
        <div className="grid min-h-36 place-items-center text-sm text-slate-400">Uyarılar yükleniyor...</div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon="alert"
          title="Aktif uyarı bulunmuyor"
          description="Sistem olağan dışı bir durum algıladığında burada listelenecek."
          className="min-h-40"
        />
      ) : (
        <ul className="m-0 flex max-h-[390px] list-none flex-col gap-2 overflow-y-auto p-0 pr-1">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className={[
                'flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 transition-all duration-200',
                severityBorderClass[alert.severity] ?? '',
                alert.isRead ? 'opacity-55' : 'hover:border-slate-400/70',
              ].join(' ')}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`rounded px-1.5 py-[2px] text-[0.68rem] font-bold uppercase tracking-[0.03em] ${severityBadgeClass[alert.severity] ?? ''}`}
                >
                  {severityLabel[alert.severity] ?? alert.severity}
                </span>
                <span className="rounded bg-slate-700/80 px-1.5 py-[2px] text-[0.72rem] text-slate-300">
                  {typeLabel(alert.type)}
                </span>
                <span className="ml-auto text-[0.7rem] text-slate-500">
                  {formatTime(alert.createdAt)}
                </span>
              </div>
              <p className="m-0 text-[0.82rem] text-slate-100">{alert.message}</p>
              {!alert.isRead && (
                <button
                  onClick={() => onMarkRead(alert.id)}
                  className="self-end rounded-lg border border-white/10 bg-transparent px-2 py-1 text-[0.72rem] text-slate-400 transition-all duration-200 hover:border-sky-300/40 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  Okundu
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
