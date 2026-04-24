import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../common/database.service';
import { CreateDeviceDto, UpdateDeviceDto, DeviceResponseDto } from './devices.dto';

/**
 * Cihaz Servis
 * Cihaz işlemlerini yönetir
 */
@Injectable()
export class DevicesService {
  constructor(private db: DatabaseService) {}

  /**
   * Cihaz Oluştur / Create Device
   */
  async createDevice(
    userId: string,
    createDeviceDto: CreateDeviceDto,
  ): Promise<DeviceResponseDto> {
    const device = await this.db.device.create({
      data: {
        name: createDeviceDto.name,
        userId,
        status: 'offline',
        lastSeen: new Date(),
      },
    });

    return this.mapToResponseDto(device);
  }

  /**
   * Cihazları Listele / Get User Devices
   */
  async getUserDevices(userId: string): Promise<DeviceResponseDto[]> {
    const devices = await this.db.device.findMany({
      where: { userId },
      orderBy: { lastSeen: 'desc' },
    });

    return devices.map(device => this.mapToResponseDto(device));
  }

  /**
   * Cihazı Getir / Get Device by ID
   */
  async getDeviceById(
    deviceId: string,
    userId: string,
  ): Promise<DeviceResponseDto> {
    const device = await this.db.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Cihaz bulunamadı');
    }

    // Kullanıcı kontrolü
    if (device.userId !== userId) {
      throw new ForbiddenException('Bu cihaza erişim yetkiniz yok');
    }

    return this.mapToResponseDto(device);
  }

  /**
   * Cihazı Güncelle / Update Device
   */
  async updateDevice(
    deviceId: string,
    userId: string,
    updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceResponseDto> {
    const device = await this.db.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Cihaz bulunamadı');
    }

    // Kullanıcı kontrolü
    if (device.userId !== userId) {
      throw new ForbiddenException('Bu cihaza erişim yetkiniz yok');
    }

    const updatedDevice = await this.db.device.update({
      where: { id: deviceId },
      data: updateDeviceDto,
    });

    return this.mapToResponseDto(updatedDevice);
  }

  /**
   * Cihazı Sil / Delete Device
   */
  async deleteDevice(deviceId: string, userId: string): Promise<void> {
    const device = await this.db.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Cihaz bulunamadı');
    }

    // Kullanıcı kontrolü
    if (device.userId !== userId) {
      throw new ForbiddenException('Bu cihaza erişim yetkiniz yok');
    }

    // İlişkili kayıtları da temizle; FK migration eksik olsa bile veriler artık kalmaz.
    await this.db.$transaction([
      this.db.alert.deleteMany({ where: { deviceId } }),
      this.db.sensorData.deleteMany({ where: { deviceId } }),
      this.db.pumpLog.deleteMany({ where: { deviceId } }),
      this.db.device.delete({ where: { id: deviceId } }),
    ]);
  }

  /**
   * Cihaz Durumunu Güncelle / Update Device Status
   * Internal method - pompa kontrolü tarafından kullanılır
   */
  async updateDeviceStatus(deviceId: string, status: string): Promise<void> {
    await this.db.device.update({
      where: { id: deviceId },
      data: {
        status,
        lastSeen: new Date(),
      },
    });
  }

  /**
   * Response DTO'ya Dönüştür / Map to Response DTO
   */
  private mapToResponseDto(device: any): DeviceResponseDto {
    return {
      id: device.id,
      name: device.name,
      status: device.status,
      lastSeen: device.lastSeen,
    };
  }
}
