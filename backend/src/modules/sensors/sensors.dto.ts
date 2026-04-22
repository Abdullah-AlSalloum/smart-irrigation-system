import { IsNumber, IsString } from 'class-validator';

/**
 * Sensör Verisi Gönder DTO / Send Sensor Data DTO
 * ESP32 tarafından gönderilen sensör verisi
 */
export class CreateSensorDataDto {
  @IsNumber()
  moisture: number; // Toprak Nemi (0-100%)

  @IsNumber()
  temperature: number; // Sıcaklık (°C)

  @IsNumber()
  ph: number; // pH Seviyesi (0-14)
}

/**
 * Sensör Verisi Cevap DTO / Sensor Data Response DTO
 */
export class SensorDataResponseDto {
  id: string;
  deviceId: string;
  moisture: number;
  temperature: number;
  ph: number;
  createdAt: Date;
}

/**
 * Sensör İstatistikleri DTO / Sensor Statistics DTO
 */
export class SensorStatisticsDto {
  averageMoisture: number;
  averageTemperature: number;
  averagePh: number;
  latestData: SensorDataResponseDto;
  dataCount: number;
}
