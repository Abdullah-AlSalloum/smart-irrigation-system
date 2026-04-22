import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

/**
 * WebSocket Ağ Geçidi
 * Real-time sensör verisi ve pompa durumu güncellemeleri gönderir
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SensorGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SensorGateway.name);

  // Bağlı istemcileri takip et: deviceId => Socket[]
  private clientsByDevice: Map<string, Set<string>> = new Map();

  /**
   * İstemci Bağlandığında / Client Connected
   */
  handleConnection(client: Socket) {
    this.logger.log(`İstemci bağlandı: ${client.id}`);
  }

  /**
   * İstemci Ayrıldığında / Client Disconnected
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`İstemci ayrıldı: ${client.id}`);
    
    // Tüm cihazlardan kaldır
    for (const [deviceId, clients] of this.clientsByDevice.entries()) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.clientsByDevice.delete(deviceId);
      }
    }
  }

  /**
   * Cihaz İçin Sensör Verilerini Dinle / Subscribe to Device
   * İstemci: 'subscribe'
   * Data: { deviceId: string }
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, data: { deviceId: string }) {
    const { deviceId } = data;

    if (!deviceId) {
      client.emit('error', { message: 'deviceId gereklidir' });
      return;
    }

    // Cihaza abone ol
    if (!this.clientsByDevice.has(deviceId)) {
      this.clientsByDevice.set(deviceId, new Set());
    }

    const clients = this.clientsByDevice.get(deviceId);
    if (!clients) {
      client.emit('error', { message: 'Abonelik durumu oluşturulamadı' });
      return;
    }

    clients.add(client.id);
    client.join(`device-${deviceId}`);

    this.logger.log(`İstemci ${client.id} cihaz ${deviceId} için abone oldu`);
    client.emit('subscribed', { deviceId });
  }

  /**
   * Cihaz Dinlemeyi Durdur / Unsubscribe from Device
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, data: { deviceId: string }) {
    const { deviceId } = data;

    const clients = this.clientsByDevice.get(deviceId);
    if (clients) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.clientsByDevice.delete(deviceId);
      }
    }

    client.leave(`device-${deviceId}`);
    this.logger.log(`İstemci ${client.id} cihaz ${deviceId} için abonelikten çıktı`);
  }

  /**
   * Yeni Sensör Verisi Event'i / New Sensor Data Event
   * Otomasyon servisi tarafından tetiklenir
   */
  @OnEvent('sensor.data.received')
  handleSensorDataReceived(payload: any) {
    const { deviceId, moisture, temperature, ph, createdAt } = payload;

    this.server.to(`device-${deviceId}`).emit('sensor-data', {
      deviceId,
      moisture,
      temperature,
      ph,
      createdAt,
      timestamp: new Date(),
    });
  }

  /**
   * Pompa Durumu Değişti / Pump Status Changed
   */
  @OnEvent('pump.status.changed')
  handlePumpStatusChanged(payload: any) {
    const { deviceId, status, lastAction, lastReason } = payload;

    this.server.to(`device-${deviceId}`).emit('pump-status', {
      deviceId,
      status,
      lastAction,
      lastReason,
      timestamp: new Date(),
    });

    // Tüm bağlı istemcilere bildir
    this.server.emit('pump-status-updated', {
      deviceId,
      status,
    });
  }

  /**
   * Uyarı Oluşturuldu / Alert Created
   */
  @OnEvent('alert.created')
  handleAlertCreated(payload: any) {
    const { deviceId, type, message, severity } = payload;

    this.server.to(`device-${deviceId}`).emit('alert', {
      deviceId,
      type,
      message,
      severity,
      timestamp: new Date(),
    });
  }

  /**
   * Cihaz Çevrimdışı Oldu / Device Offline
   */
  @OnEvent('device.offline')
  handleDeviceOffline(payload: any) {
    const { deviceId, deviceName } = payload;

    this.server.emit('device-offline', {
      deviceId,
      deviceName,
      timestamp: new Date(),
    });
  }

  /**
   * Otomasyon Aksiyonu / Automation Action
   */
  @OnEvent('automation.action')
  handleAutomationAction(payload: any) {
    const { deviceId, type, action, reason } = payload;

    this.server.to(`device-${deviceId}`).emit('automation-action', {
      deviceId,
      type,
      action,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * Manuel İleti Gönder / Send Manual Message
   */
  @SubscribeMessage('message')
  handleMessage(client: Socket, data: { deviceId: string; message: string }) {
    const { deviceId, message } = data;

    this.server.to(`device-${deviceId}`).emit('message', {
      deviceId,
      message,
      timestamp: new Date(),
    });
  }
}
