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
exports.PumpService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../common/database.service");
const pump_dto_1 = require("./pump.dto");
const event_emitter_1 = require("@nestjs/event-emitter");
let PumpService = class PumpService {
    db;
    eventEmitter;
    pumpStates = new Map();
    constructor(db, eventEmitter) {
        this.db = db;
        this.eventEmitter = eventEmitter;
    }
    async controlPump(deviceId, controlPumpDto) {
        const device = await this.db.device.findUnique({
            where: { id: deviceId },
        });
        if (!device) {
            throw new common_1.NotFoundException('Cihaz bulunamadı');
        }
        if (!Object.values(pump_dto_1.PumpAction).includes(controlPumpDto.action)) {
            throw new common_1.BadRequestException('Geçersiz pompa aksiyonu');
        }
        const pumpLog = await this.db.pumpLog.create({
            data: {
                deviceId,
                action: controlPumpDto.action,
                reason: controlPumpDto.reason,
            },
        });
        const pumpStatus = {
            status: controlPumpDto.action,
            lastAction: pumpLog.timestamp,
            lastReason: controlPumpDto.reason,
        };
        this.pumpStates.set(deviceId, pumpStatus);
        this.eventEmitter.emit('pump.status.changed', {
            deviceId,
            ...pumpStatus,
        });
        return {
            deviceId,
            ...pumpStatus,
        };
    }
    async getPumpStatus(deviceId) {
        const device = await this.db.device.findUnique({
            where: { id: deviceId },
        });
        if (!device) {
            throw new common_1.NotFoundException('Cihaz bulunamadı');
        }
        let status = this.pumpStates.get(deviceId);
        if (!status) {
            const lastLog = await this.db.pumpLog.findFirst({
                where: { deviceId },
                orderBy: { timestamp: 'desc' },
            });
            if (!lastLog) {
                status = {
                    status: 'OFF',
                    lastAction: new Date(),
                    lastReason: 'İlk başlatma',
                };
            }
            else {
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
    async getPumpLogs(deviceId, limit = 50) {
        const device = await this.db.device.findUnique({
            where: { id: deviceId },
        });
        if (!device) {
            throw new common_1.NotFoundException('Cihaz bulunamadı');
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
    async autoControlPump(deviceId, action, reason) {
        try {
            await this.controlPump(deviceId, {
                action: action,
                reason,
            });
        }
        catch (error) {
            console.error(`Pompa kontrolü başarısız: ${deviceId}`, error);
        }
    }
};
exports.PumpService = PumpService;
exports.PumpService = PumpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService, event_emitter_1.EventEmitter2])
], PumpService);
//# sourceMappingURL=pump.service.js.map