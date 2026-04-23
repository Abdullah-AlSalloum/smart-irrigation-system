import { io, type Socket } from "socket.io-client";

export function getSocketBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3002/api";

  return apiBaseUrl.replace(/\/api\/?$/, "");
}

export function createSensorSocket(): Socket {
  return io(getSocketBaseUrl(), {
    autoConnect: false,
    transports: ["polling"],
    upgrade: false,
  });
}