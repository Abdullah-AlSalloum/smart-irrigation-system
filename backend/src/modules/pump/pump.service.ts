import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { DatabaseService } from '../../common/database.service';
import { ControlPumpDto, PumpStatusResponseDto, PumpAction, PumpLogDto } from './pump.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Pompa Servis
 * Pompa kontrol işlemlerini yönetir
 */
@Injectable()
export class PumpService {
  // Pompa durumlarını hafızada tutarız
  private pumpStates: Map<string, { status: string; lastAction: Date; lastReason: string }> =
    new Map();

  constructor(private db: DatabaseService, private eventEmitter: EventEmitter2) {}

  /**
   * Pompa Kontrol / Control Pump (ON/OFF)
   */
  async controlPump(
    deviceId: string,
    controlPumpDto: ControlPumpDto,
  ): Promise<PumpStatusResponseDto> {
    // Cihaz var mı kontrol et
    const device = await this.db.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Cihaz bulunamadı');
    }

    // Pompa kontrol değeri doğru mu?
    if (!Object.values(PumpAction).includes(controlPumpDto.action)) {
      throw new BadRequestException('Geçersiz pompa aksiyonu');
    }

    // Pompa logu kaydet
    const pumpLog = await this.db.pumpLog.create({
      data: {
        deviceId,
        action: controlPumpDto.action,
        reason: controlPumpDto.reason,
      },
    });

    // Pompa durumunu güncelle
    const pumpStatus = {
      status: controlPumpDto.action,
      lastAction: pumpLog.timestamp,
      lastReason: controlPumpDto.reason,
    };

    this.pumpStates.set(deviceId, pumpStatus);

    // WebSocket aracılığıyla real-time güncelleme gönder
    this.eventEmitter.emit('pump.status.changed', {
      deviceId,
      ...pumpStatus,
    });

    return {
      deviceId,
      ...pumpStatus,
    };
  }

  /**
   * Pompa Durumunu Getir / Get Pump Status
   */
  async getPumpStatus(deviceId: string): Promise<PumpStatusResponseDto> {
    // Cihaz var mı kontrol et
    const device = await this.db.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Cihaz bulunamadı');
    }

    // Hafızadan getir, yoksa veritabanından getir
    let status = this.pumpStates.get(deviceId);

    if (!status) {
      // Son pompa logu getir
      const lastLog = await this.db.pumpLog.findFirst({
        where: { deviceId },
        orderBy: { timestamp: 'desc' },
      });

      if (!lastLog) {
        // Hiçbir kayıt yoksa varsayılan OFF
        status = {
          status: 'OFF',
          lastAction: new Date(),
          lastReason: 'İlk başlatma',
        };
      } else {
        status = {
          status: lastLog.action,
          lastAction: lastLog.timestamp,
          lastReason: lastLog.reason,
        };
      }

      this.pumpStates.set(deviceId, status);
    }

    return {
      deviceId,
      ...status,
    };
  }

  /**
   * Pompa Loglarını Getir / Get Pump Logs
   */
  async getPumpLogs(deviceId: string, limit: number = 50): Promise<PumpLogDto[]> {
    const device = await this.db.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Cihaz bulunamadı');
    }

    const logs = await this.db.pumpLog.findMany({
      where: { deviceId },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    return logs.map(log => ({
      id: log.id,
      deviceId: log.deviceId,
      action: log.action,
      reason: log.reason,
      timestamp: log.timestamp,
    }));
  }

  /**
   * Otomasyondan Pompa Kontrolü / Auto Control Pump (Otomasyon tarafından çağrılır)
   */
  async autoControlPump(deviceId: string, action: string, reason: string): Promise<void> {
    try {
      await this.controlPump(deviceId, {
        action: action as PumpAction,
        reason,
      });
    } catch (error) {
      console.error(`Pompa kontrolü başarısız: ${deviceId}`, error);
    }
  }
}
