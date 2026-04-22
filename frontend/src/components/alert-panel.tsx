'use client';

import { Alert } from '@/lib/protected-api-client';
import styles from './alert-panel.module.css';

interface AlertPanelProps {
  alerts: Alert[];
  isLoading: boolean;
  onMarkRead: (alertId: string) => void;
  onMarkAllRead: () => void;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('tr-TR', {
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

export default function AlertPanel({ alerts, isLoading, onMarkRead, onMarkAllRead }: AlertPanelProps) {
  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Uyarılar
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount}</span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={onMarkAllRead}>
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.empty}>Yükleniyor...</div>
      ) : alerts.length === 0 ? (
        <div className={styles.empty}>Uyarı yok</div>
      ) : (
        <ul className={styles.list}>
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className={`${styles.item} ${styles[alert.severity]} ${alert.isRead ? styles.read : ''}`}
            >
              <div className={styles.itemTop}>
                <span className={`${styles.severityBadge} ${styles[alert.severity + 'Badge']}`}>
                  {alert.severity === 'critical' ? 'Kritik' : alert.severity === 'warning' ? 'Uyarı' : 'Bilgi'}
                </span>
                <span className={styles.typeTag}>{typeLabel(alert.type)}</span>
                <span className={styles.time}>{formatTime(alert.createdAt)}</span>
              </div>
              <p className={styles.message}>{alert.message}</p>
              {!alert.isRead && (
                <button
                  className={styles.readBtn}
                  onClick={() => onMarkRead(alert.id)}
                >
                  Okundu
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
