import { Injectable, Inject } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { DatabaseService } from '../../common/database.service';
import { ConfigService } from '../../config/config.service';
import { PumpService } from '../pump/pump.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Otomasyon Servis
 * Sensör verilerine göre pompayı otomatik kontrol eder
 * Uyarı ve bildirimler gönderir
 */
@Injectable()
export class AutomationService {
  constructor(
    private db: DatabaseService,
    private configService: ConfigService,
    private pumpService: PumpService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Otomasyon Lojiği / Automation Logic
   * Her 10 saniyede çalışır
   */
  @Interval(10000)
  async processAutomation(): Promise<void> {
    try {
      // Tüm cihazları al
      const devices = await this.db.device.findMany();

      for (const device of devices) {
        await this.processDeviceAutomation(device.id);
      }
    } catch (error) {
      console.error('Otomasyon işlemi sırasında hata:', error);
    }
  }

  /**
   * Belirli Cihaz İçin Otomasyon İşlemi / Process Automation for Device
   */
  private async processDeviceAutomation(deviceId: string): Promise<void> {
    try {
      // Son sensör verilerini getir
      const latestSensor = await this.db.sensorData.findFirst({
        where: { deviceId },
        orderBy: { createdAt: 'desc' },
      });

      if (!latestSensor) {
        return; // Henüz sensör verisi yok
      }

      // Pompa kontrolü: Nem seviyesine göre
      await this.handleMoistureControl(deviceId, latestSensor.moisture);

      // Uyarıları kontrol et
      await this.checkAndCreateAlerts(deviceId, latestSensor);
    } catch (error) {
      console.error(`Cihaz ${deviceId} için otomasyon işlemi başarısız:`, error);
    }
  }

  /**
   * Nem Seviyesine Göre Pompa Kontrolü / Handle Moisture Control
   * Mantık:
   * - Nem < 30% → Pompayı aç
   * - Nem > 60% → Pompayı kapat
   */
  private async handleMoistureControl(deviceId: string, moisture: number): Promise<void> {
    const minThreshold = this.configService.moistureMinThreshold;
    const maxThreshold = this.configService.moistureMaxThreshold;

    const currentPumpStatus = await this.pumpService.getPumpStatus(deviceId);

    if (moisture < minThreshold && currentPumpStatus.status === 'OFF') {
      // Nem çok düşük, pompayı aç
      await this.pumpService.autoControlPump(
        deviceId,
        'ON',
        `Otomatik kontrol - Nem çok düşük: ${moisture}%`,
      );

      this.eventEmitter.emit('automation.action', {
        deviceId,
        type: 'pump',
        action: 'ON',
        reason: `Nem seviyesi ${moisture}% (minimum: ${minThreshold}%)`,
      });
    } else if (moisture > maxThreshold && currentPumpStatus.status === 'ON') {
      // Nem yeterli, pompayı kapat
      await this.pumpService.autoControlPump(
        deviceId,
        'OFF',
        `Otomatik kontrol - Nem yeterli: ${moisture}%`,
      );

      this.eventEmitter.emit('automation.action', {
        deviceId,
        type: 'pump',
        action: 'OFF',
        reason: `Nem seviyesi ${moisture}% (maksimum: ${maxThreshold}%)`,
      });
    }
  }

  /**
   * Uyarı ve Bildirim Kontrolü / Check and Create Alerts
   */
  private async checkAndCreateAlerts(deviceId: string, sensor: any): Promise<void> {
    const alerts: any[] = [];

    const phMin = this.configService.phMinThreshold;
    const phMax = this.configService.phMaxThreshold;
    const tempMax = this.configService.temperatureMaxThreshold;

    // pH Uyarısı
    if (sensor.ph < phMin || sensor.ph > phMax) {
      alerts.push({
        deviceId,
        type: 'ph',
        message: `pH seviyesi anormal: ${sensor.ph} (Normal aralık: ${phMin}-${phMax})`,
        severity: sensor.ph < phMin - 1 || sensor.ph > phMax + 1 ? 'critical' : 'warning',
      });
    }

    // Sıcaklık Uyarısı
    if (sensor.temperature > tempMax) {
      alerts.push({
        deviceId,
        type: 'temperature',
        message: `Sıcaklık çok yüksek: ${sensor.temperature}°C (Maksimum: ${tempMax}°C)`,
        severity: sensor.temperature > tempMax + 5 ? 'critical' : 'warning',
      });
    }

    // Uyarıları kaydet
    for (const alert of alerts) {
      // Aynı uyarıyı tekrar kaydetmemek için kontrol
      const existingAlert = await this.db.alert.findFirst({
        where: {
          deviceId,
          type: alert.type,
          isRead: false,
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Son 5 dakika
          },
        },
      });

      if (!existingAlert) {
        await this.db.alert.create({
          data: alert,
        });

        this.eventEmitter.emit('alert.created', alert);
      }
    }
  }

  /**
   * Çevrimdışı Cihaz Kontrolü / Check Offline Devices
   * Her 1 dakikada çalışır
   */
  @Interval(60000)
  async checkOfflineDevices(): Promise<void> {
    try {
      const devices = await this.db.device.findMany({
        where: { status: 'online' },
      });

      for (const device of devices) {
        // Eğer 2 dakikadan fazla veri almamışsa çevrimdışı olarak işaretle
        const lastDataTime = new Date(Date.now() - 2 * 60 * 1000);

        if (device.lastSeen < lastDataTime) {
          await this.db.device.update({
            where: { id: device.id },
            data: { status: 'offline' },
          });

          this.eventEmitter.emit('device.offline', {
            deviceId: device.id,
            deviceName: device.name,
          });
        }
      }
    } catch (error) {
      console.error('Çevrimdışı cihaz kontrolü sırasında hata:', error);
    }
  }
}
