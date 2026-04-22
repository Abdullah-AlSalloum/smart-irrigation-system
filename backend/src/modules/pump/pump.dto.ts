import { IsString, IsEnum } from 'class-validator';

export enum PumpAction {
  ON = 'ON',
  OFF = 'OFF',
}

/**
 * Pompa Kontrol DTO / Pump Control DTO
 */
export class ControlPumpDto {
  @IsEnum(PumpAction)
  action: PumpAction;

  @IsString()
  reason: string; // Neden kontrol edildi
}

/**
 * Pompa Durumu Cevap DTO / Pump Status Response DTO
 */
export class PumpStatusResponseDto {
  deviceId: string;
  status: string; // ON, OFF
  lastAction: Date;
  lastReason: string;
}

/**
 * Pompa Logu DTO / Pump Log DTO
 */
export class PumpLogDto {
  id: string;
  deviceId: string;
  action: string;
  reason: string;
  timestamp: Date;
}
