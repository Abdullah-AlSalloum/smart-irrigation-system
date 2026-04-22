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
exports.SensorsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../common/database.service");
let SensorsService = class SensorsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createSensorData(deviceId, createSensorDataDto) {
        const device = await this.db.device.findUnique({
            where: { id: deviceId },
        });
        if (!device) {
            throw new common_1.NotFoundException('Cihaz bulunamadı');
        }
        this.validateSensorData(createSensorDataDto);
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
        return this.mapToResponseDto(sensorData);
    }
    async getLatestSensorData(deviceId, limit = 100) {
        const device = await this.db.device.findUnique({
            where: { id: deviceId },
        });
        if (!device) {
            throw new common_1.NotFoundException('Cihaz bulunamadı');
        }
        const sensorData = await this.db.sensorData.findMany({
            where: { deviceId },
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
        return sensorData.map(data => this.mapToResponseDto(data));
    }
    async getSensorStatistics(deviceId, hours = 24) {
        const device = await this.db.device.findUnique({
            where: { id: deviceId },
        });
        if (!device) {
            throw new common_1.NotFoundException('Cihaz bulunamadı');
        }
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        const sensorData = await this.db.sensorData.findMany({
            where: {
                deviceId,
                createdAt: { gte: since },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (sensorData.length === 0) {
            throw new common_1.NotFoundException('Bu dönem için sensör verisi bulunamadı');
        }
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
    validateSensorData(data) {
        if (data.moisture < 0 || data.moisture > 100) {
            throw new common_1.BadRequestException('Nem değeri 0-100 arasında olmalıdır');
        }
        if (data.temperature < -50 || data.temperature > 50) {
            throw new common_1.BadRequestException('Sıcaklık değeri -50 ile 50 arasında olmalıdır');
        }
        if (data.ph < 0 || data.ph > 14) {
            throw new common_1.BadRequestException('pH değeri 0-14 arasında olmalıdır');
        }
    }
    mapToResponseDto(data) {
        return {
            id: data.id,
            deviceId: data.deviceId,
            moisture: data.moisture,
            temperature: data.temperature,
            ph: data.ph,
            createdAt: data.createdAt,
        };
    }
};
exports.SensorsService = SensorsService;
exports.SensorsService = SensorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], SensorsService);
//# sourceMappingURL=sensors.service.js.map