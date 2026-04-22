import { Injectable } from '@nestjs/common';

/**
 * Yapılandırma Servis
 * Çevre değişkenlerini ve sistem ayarlarını yönetir
 */
@Injectable()
export class ConfigService {
  private readonly envConfig: Record<string, any>;

  constructor() {
    this.envConfig = process.env;
  }

  get(key: string): string | undefined {
    return this.envConfig[key] || process.env[key];
  }

  getNumber(key: string): number {
    return parseInt(this.get(key) || '0', 10);
  }

  getBoolean(key: string): boolean {
    const value = this.get(key);
    return value ? value === 'true' : false;
  }

  // Database Configuration
  get databaseUrl(): string {
    return this.get('DATABASE_URL') || 'postgresql://localhost:5432/sulama_db';
  }

  // JWT Configuration
  get jwtSecret(): string {
    return this.get('JWT_SECRET') || 'default-secret-key';
  }

  get jwtExpiration(): string {
    return this.get('JWT_EXPIRATION') || '24h';
  }

  // Application Configuration
  get port(): number {
    return this.getNumber('PORT') || 3000;
  }

  get nodeEnv(): string {
    return this.get('NODE_ENV') || 'development';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  // ESP32 Configuration
  get esp32ApiTimeout(): number {
    return this.getNumber('ESP32_API_TIMEOUT') || 5000;
  }

  get sensorDataInterval(): number {
    return this.getNumber('SENSOR_DATA_INTERVAL') || 5000;
  }

  // Automation Thresholds
  get moistureMinThreshold(): number {
    return this.getNumber('MOISTURE_MIN_THRESHOLD') || 30;
  }

  get moistureMaxThreshold(): number {
    return this.getNumber('MOISTURE_MAX_THRESHOLD') || 60;
  }

  get phMinThreshold(): number {
    return this.getNumber('PH_MIN_THRESHOLD') || 5.5;
  }

  get phMaxThreshold(): number {
    return this.getNumber('PH_MAX_THRESHOLD') || 7.5;
  }

  get temperatureMaxThreshold(): number {
    return this.getNumber('TEMPERATURE_MAX_THRESHOLD') || 35;
  }
}
