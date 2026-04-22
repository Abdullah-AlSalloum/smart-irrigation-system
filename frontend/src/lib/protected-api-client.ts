import { getStoredToken } from './auth-service';

interface ApiResponse<T> {
  data?: T;
  error?: string;
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
      return {
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json() as T;
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
