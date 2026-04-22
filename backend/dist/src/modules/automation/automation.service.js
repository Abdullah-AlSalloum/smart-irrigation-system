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
exports.AutomationService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const database_service_1 = require("../../common/database.service");
const config_service_1 = require("../../config/config.service");
const pump_service_1 = require("../pump/pump.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let AutomationService = class AutomationService {
    db;
    configService;
    pumpService;
    eventEmitter;
    constructor(db, configService, pumpService, eventEmitter) {
        this.db = db;
        this.configService = configService;
        this.pumpService = pumpService;
        this.eventEmitter = eventEmitter;
    }
    async processAutomation() {
        try {
            const devices = await this.db.device.findMany();
            for (const device of devices) {
                await this.processDeviceAutomation(device.id);
            }
        }
        catch (error) {
            console.error('Otomasyon işlemi sırasında hata:', error);
        }
    }
    async processDeviceAutomation(deviceId) {
        try {
            const latestSensor = await this.db.sensorData.findFirst({
                where: { deviceId },
                orderBy: { createdAt: 'desc' },
            });
            if (!latestSensor) {
                return;
            }
            await this.handleMoistureControl(deviceId, latestSensor.moisture);
            await this.checkAndCreateAlerts(deviceId, latestSensor);
        }
        catch (error) {
            console.error(`Cihaz ${deviceId} için otomasyon işlemi başarısız:`, error);
        }
    }
    async handleMoistureControl(deviceId, moisture) {
        const minThreshold = this.configService.moistureMinThreshold;
        const maxThreshold = this.configService.moistureMaxThreshold;
        const currentPumpStatus = await this.pumpService.getPumpStatus(deviceId);
        if (moisture < minThreshold && currentPumpStatus.status === 'OFF') {
            await this.pumpService.autoControlPump(deviceId, 'ON', `Otomatik kontrol - Nem çok düşük: ${moisture}%`);
            this.eventEmitter.emit('automation.action', {
                deviceId,
                type: 'pump',
                action: 'ON',
                reason: `Nem seviyesi ${moisture}% (minimum: ${minThreshold}%)`,
            });
        }
        else if (moisture > maxThreshold && currentPumpStatus.status === 'ON') {
            await this.pumpService.autoControlPump(deviceId, 'OFF', `Otomatik kontrol - Nem yeterli: ${moisture}%`);
            this.eventEmitter.emit('automation.action', {
                deviceId,
                type: 'pump',
                action: 'OFF',
                reason: `Nem seviyesi ${moisture}% (maksimum: ${maxThreshold}%)`,
            });
        }
    }
    async checkAndCreateAlerts(deviceId, sensor) {
        const alerts = [];
        const phMin = this.configService.phMinThreshold;
        const phMax = this.configService.phMaxThreshold;
        const tempMax = this.configService.temperatureMaxThreshold;
        if (sensor.ph < phMin || sensor.ph > phMax) {
            alerts.push({
                deviceId,
                type: 'ph',
                message: `pH seviyesi anormal: ${sensor.ph} (Normal aralık: ${phMin}-${phMax})`,
                severity: sensor.ph < phMin - 1 || sensor.ph > phMax + 1 ? 'critical' : 'warning',
            });
        }
        if (sensor.temperature > tempMax) {
            alerts.push({
                deviceId,
                type: 'temperature',
                message: `Sıcaklık çok yüksek: ${sensor.temperature}°C (Maksimum: ${tempMax}°C)`,
                severity: sensor.temperature > tempMax + 5 ? 'critical' : 'warning',
            });
        }
        for (const alert of alerts) {
            const existingAlert = await this.db.alert.findFirst({
                where: {
                    deviceId,
                    type: alert.type,
                    isRead: false,
                    createdAt: {
                        gte: new Date(Date.now() - 5 * 60 * 1000),
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
    async checkOfflineDevices() {
        try {
            const devices = await this.db.device.findMany({
                where: { status: 'online' },
            });
            for (const device of devices) {
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
        }
        catch (error) {
            console.error('Çevrimdışı cihaz kontrolü sırasında hata:', error);
        }
    }
};
exports.AutomationService = AutomationService;
__decorate([
    (0, schedule_1.Interval)(10000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutomationService.prototype, "processAutomation", null);
__decorate([
    (0, schedule_1.Interval)(60000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutomationService.prototype, "checkOfflineDevices", null);
exports.AutomationService = AutomationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        config_service_1.ConfigService,
        pump_service_1.PumpService,
        event_emitter_1.EventEmitter2])
], AutomationService);
//# sourceMappingURL=automation.service.js.map