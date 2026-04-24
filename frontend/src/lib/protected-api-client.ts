import { getStoredToken } from './auth-service';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export interface Device {
  id: string;
  name: string;
  status: string;
  lastSeen: string;
}

export interface CreateDevicePayload {
  name: string;
  description?: string;
}

export interface SensorData {
  id: string;
  deviceId: string;
  moisture: number;
  temperature: number;
  ph: number;
  createdAt: string;
}

export interface PumpStatusResponse {
  deviceId: string;
  status: "ON" | "OFF";
  lastAction: string;
  lastReason: string;
}

export interface Alert {
  id: string;
  deviceId: string;
  type: string;
  message: string;
  severity: "info" | "warning" | "critical";
  isRead: boolean;
  createdAt: string;
}

/**
 * Korumalı API çağrısı yapar - Authorization header'ı ekler
 * @param url API endpoint'i (örn: '/devices')
 * @param options Fetch options
 * @returns API yanıtı veya error
 */
export async function fetchWithToken<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredToken();

  if (!token) {
    unauthorizedHandler?.();
    return { error: 'Token bulunamadı - lütfen giriş yapın' };
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        unauthorizedHandler?.();
      }
      return {
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const contentLength = response.headers.get('content-length');
    const hasBody = contentLength !== '0' && response.status !== 204;
    const data = hasBody ? await response.json() as T : undefined as T;
    return { data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { error: `API çağrısı başarısız: ${message}` };
  }
}

/**
 * Cihaz listesini API'den getir
 */
export async function fetchDevices(): Promise<ApiResponse<Device[]>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  return fetchWithToken<Device[]>(`${baseUrl}/devices`, {
    method: 'GET',
  });
}

/**
 * Yeni cihaz olustur
 */
export async function createDevice(
  payload: CreateDevicePayload,
): Promise<ApiResponse<Device>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return fetchWithToken<Device>(`${baseUrl}/devices`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Cihaz sil
 */
export async function deleteDevice(
  deviceId: string,
): Promise<ApiResponse<void>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return fetchWithToken<void>(`${baseUrl}/devices/${deviceId}`, {
    method: 'DELETE',
  });
}

/**
 * Test sensör verisi uret
 */
export async function emitTestSensorData(
  deviceId: string,
): Promise<ApiResponse<SensorData>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return fetchWithToken<SensorData>(`${baseUrl}/sensors/${deviceId}/test`, {
    method: 'POST',
  });
}

/**
 * Cihaza ait son sensör verilerini getir
 */
export async function fetchSensorHistory(
  deviceId: string,
  limit = 48,
): Promise<ApiResponse<SensorData[]>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return fetchWithToken<SensorData[]>(`${baseUrl}/sensors/${deviceId}?limit=${limit}`, {
    method: 'GET',
  });
}

/**
 * Cihazin pompa durumunu getir
 */
export async function fetchPumpStatus(
  deviceId: string,
): Promise<ApiResponse<PumpStatusResponse>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return fetchWithToken<PumpStatusResponse>(`${baseUrl}/pump/status/${deviceId}`, {
    method: 'GET',
  });
}

/**
 * Pompayi ac
 */
export async function turnPumpOn(
  deviceId: string,
): Promise<ApiResponse<PumpStatusResponse>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return fetchWithToken<PumpStatusResponse>(`${baseUrl}/pump/on/${deviceId}`, {
    method: 'POST',
  });
}

/**
 * Pompayi kapat
 */
export async function turnPumpOff(
  deviceId: string,
): Promise<ApiResponse<PumpStatusResponse>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return fetchWithToken<PumpStatusResponse>(`${baseUrl}/pump/off/${deviceId}`, {
    method: 'POST',
  });
}

/**
 * Cihaza ait uyarıları getir
 */
export async function fetchAlerts(
  deviceId: string,
  limit = 50,
): Promise<ApiResponse<Alert[]>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return fetchWithToken<Alert[]>(`${baseUrl}/alerts/${deviceId}?limit=${limit}`, {
    method: 'GET',
  });
}

/**
 * Uyarıyı okundu olarak işaretle
 */
export async function markAlertRead(alertId: string): Promise<ApiResponse<Alert>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return fetchWithToken<Alert>(`${baseUrl}/alerts/${alertId}/read`, {
    method: 'PATCH',
  });
}

/**
 * Cihaza ait tüm uyarıları okundu olarak işaretle
 */
export async function markAllAlertsRead(
  deviceId: string,
): Promise<ApiResponse<{ count: number }>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return fetchWithToken<{ count: number }>(`${baseUrl}/alerts/${deviceId}/read-all`, {
    method: 'PATCH',
  });
}
