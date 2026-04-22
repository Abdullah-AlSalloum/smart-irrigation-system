import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from '../../common/database.service';
import { CreateSensorDataDto, SensorDataResponseDto, SensorStatisticsDto } from './sensors.dto';

/**
 * Sensör Servis
 * Sensör verisi işlemlerini yönetir
 */
@Injectable()
export class SensorsService {
  constructor(
    private db: DatabaseService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Sensör Verisi Oluştur / Create Sensor Data
   * ESP32 tarafından gönderilen sensör verilerini kaydet
   */
  async createSensorData(
    deviceId: string,
    createSensorDataDto: CreateSensorDataDto,
  ): Promise<SensorDataResponseDto> {
    await this.ensureDeviceExists(deviceId);

    // Sensör verilerini doğrula
    this.validateSensorData(createSensorDataDto);

    const sensorData = await this.persistSensorData(deviceId, createSensorDataDto);

    this.eventEmitter.emit('sensor.data.received', {
      deviceId,
      moisture: sensorData.moisture,
      temperature: sensorData.temperature,
      ph: sensorData.ph,
      createdAt: sensorData.createdAt,
    });

    return this.mapToResponseDto(sensorData);
  }

  /**
   * Test için sahte sensör verisi üret ve kaydet
   */
  async createTestSensorData(
    deviceId: string,
    userId: string,
  ): Promise<SensorDataResponseDto> {
    const device = await this.db.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Cihaz bulunamadı');
    }

    if (device.userId !== userId) {
      throw new ForbiddenException('Bu cihaza erişim yetkiniz yok');
    }

    const createSensorDataDto: CreateSensorDataDto = {
      moisture: this.randomBetween(35, 70),
      temperature: this.randomBetween(18, 32),
      ph: this.randomBetween(5.8, 7.1),
    };

    return this.createSensorData(deviceId, createSensorDataDto);
  }

  /**
   * Son Sensör Verilerini Getir / Get Latest Sensor Data
   */
  async getLatestSensorData(
    deviceId: string,
    limit: number = 100,
  ): Promise<SensorDataResponseDto[]> {
    const device = await this.db.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Cihaz bulunamadı');
    }

    const sensorData = await this.db.sensorData.findMany({
      where: { deviceId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return sensorData.map(data => this.mapToResponseDto(data));
  }

  /**
   * Sensör İstatistikleri / Get Sensor Statistics
   */
  async getSensorStatistics(
    deviceId: string,
    hours: number = 24,
  ): Promise<SensorStatisticsDto> {
    const device = await this.db.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Cihaz bulunamadı');
    }

    // Son N saatin verilerini getir
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const sensorData = await this.db.sensorData.findMany({
      where: {
        deviceId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (sensorData.length === 0) {
      throw new NotFoundException('Bu dönem için sensör verisi bulunamadı');
    }

    // Ortalamaları hesapla
    const avgMoisture = sensorData.reduce((sum, d) => sum + d.moisture, 0) / sensorData.length;
    const avgTemperature = sensorData.reduce((sum, d) => sum + d.temperature, 0) / sensorData.length;
    const avgPh = sensorData.reduce((sum, d) => sum + d.ph, 0) / sensorData.length;

    return {
      averageMoisture: Math.round(avgMoisture * 100) / 100,
      averageTemperature: Math.round(avgTemperature * 100) / 100,
      averagePh: Math.round(avgPh * 100) / 100,
      latestData: this.mapToResponseDto(sensorData[0]),
      dataCount: sensorData.length,
    };
  }

  /**
   * Sensör Verilerini Doğrula / Validate Sensor Data
   */
  private validateSensorData(data: CreateSensorDataDto): void {
    if (data.moisture < 0 || data.moisture > 100) {
      throw new BadRequestException('Nem değeri 0-100 arasında olmalıdır');
    }

    if (data.temperature < -50 || data.temperature > 50) {
      throw new BadRequestException('Sıcaklık değeri -50 ile 50 arasında olmalıdır');
    }

    if (data.ph < 0 || data.ph > 14) {
      throw new BadRequestException('pH değeri 0-14 arasında olmalıdır');
    }
  }

  private async ensureDeviceExists(deviceId: string): Promise<void> {
    const device = await this.db.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Cihaz bulunamadı');
    }
  }

  private async persistSensorData(
    deviceId: string,
    createSensorDataDto: CreateSensorDataDto,
  ) {
    const sensorData = await this.db.sensorData.create({
      data: {
        deviceId,
        moisture: createSensorDataDto.moisture,
        temperature: createSensorDataDto.temperature,
        ph: createSensorDataDto.ph,
      },
    });

    await this.db.device.update({
      where: { id: deviceId },
      data: { lastSeen: new Date() },
    });

    return sensorData;
  }

  private randomBetween(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }

  /**
   * Response DTO'ya Dönüştür / Map to Response DTO
   */
  private mapToResponseDto(data: any): SensorDataResponseDto {
    return {
      id: data.id,
      deviceId: data.deviceId,
      moisture: data.moisture,
      temperature: data.temperature,
      ph: data.ph,
      createdAt: data.createdAt,
    };
  }
}
