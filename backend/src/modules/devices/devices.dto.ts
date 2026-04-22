import { IsString, IsOptional } from 'class-validator';

/**
 * Cihaz Oluştur DTO / Create Device DTO
 */
export class CreateDeviceDto {
  @IsString()
  name: string; // Cihaz adı

  @IsOptional()
  @IsString()
  description?: string; // Cihaz açıklaması
}

/**
 * Cihaz Güncelle DTO / Update Device DTO
 */
export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

/**
 * Cihaz Cevap DTO / Device Response DTO
 */
export class DeviceResponseDto {
  id: string;
  name: string;
  status: string; // online, offline, error
  lastSeen: Date;
  createdAt?: Date;
}
