"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
let ConfigService = class ConfigService {
    envConfig;
    constructor() {
        this.envConfig = process.env;
    }
    get(key) {
        return this.envConfig[key] || process.env[key];
    }
    getNumber(key) {
        return parseInt(this.get(key) || '0', 10);
    }
    getBoolean(key) {
        const value = this.get(key);
        return value ? value === 'true' : false;
    }
    get databaseUrl() {
        return this.get('DATABASE_URL') || 'postgresql://localhost:5432/sulama_db';
    }
    get jwtSecret() {
        return this.get('JWT_SECRET') || 'default-secret-key';
    }
    get jwtExpiration() {
        return this.get('JWT_EXPIRATION') || '24h';
    }
    get port() {
        return this.getNumber('PORT') || 3000;
    }
    get nodeEnv() {
        return this.get('NODE_ENV') || 'development';
    }
    get isDevelopment() {
        return this.nodeEnv === 'development';
    }
    get esp32ApiTimeout() {
        return this.getNumber('ESP32_API_TIMEOUT') || 5000;
    }
    get sensorDataInterval() {
        return this.getNumber('SENSOR_DATA_INTERVAL') || 5000;
    }
    get moistureMinThreshold() {
        return this.getNumber('MOISTURE_MIN_THRESHOLD') || 30;
    }
    get moistureMaxThreshold() {
        return this.getNumber('MOISTURE_MAX_THRESHOLD') || 60;
    }
    get phMinThreshold() {
        return this.getNumber('PH_MIN_THRESHOLD') || 5.5;
    }
    get phMaxThreshold() {
        return this.getNumber('PH_MAX_THRESHOLD') || 7.5;
    }
    get temperatureMaxThreshold() {
        return this.getNumber('TEMPERATURE_MAX_THRESHOLD') || 35;
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ConfigService);
//# sourceMappingURL=config.service.js.map