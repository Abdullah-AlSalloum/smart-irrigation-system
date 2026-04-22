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
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../common/database.service");
let DevicesService = class DevicesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createDevice(userId, createDeviceDto) {
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
    async getUserDevices(userId) {
        const devices = await this.db.device.findMany({
            where: { userId },
            orderBy: { lastSeen: 'desc' },
        });
        return devices.map(device => this.mapToResponseDto(device));
    }
    async getDeviceById(deviceId, userId) {
        const device = await this.db.device.findUnique({
            where: { id: deviceId },
        });
        if (!device) {
            throw new common_1.NotFoundException('Cihaz bulunamadı');
        }
        if (device.userId !== userId) {
            throw new common_1.ForbiddenException('Bu cihaza erişim yetkiniz yok');
        }
        return this.mapToResponseDto(device);
    }
    async updateDevice(deviceId, userId, updateDeviceDto) {
        const device = await this.db.device.findUnique({
            where: { id: deviceId },
        });
        if (!device) {
            throw new common_1.NotFoundException('Cihaz bulunamadı');
        }
        if (device.userId !== userId) {
            throw new common_1.ForbiddenException('Bu cihaza erişim yetkiniz yok');
        }
        const updatedDevice = await this.db.device.update({
            where: { id: deviceId },
            data: updateDeviceDto,
        });
        return this.mapToResponseDto(updatedDevice);
    }
    async deleteDevice(deviceId, userId) {
        const device = await this.db.device.findUnique({
            where: { id: deviceId },
        });
        if (!device) {
            throw new common_1.NotFoundException('Cihaz bulunamadı');
        }
        if (device.userId !== userId) {
            throw new common_1.ForbiddenException('Bu cihaza erişim yetkiniz yok');
        }
        await this.db.device.delete({
            where: { id: deviceId },
        });
    }
    async updateDeviceStatus(deviceId, status) {
        await this.db.device.update({
            where: { id: deviceId },
            data: {
                status,
                lastSeen: new Date(),
            },
        });
    }
    mapToResponseDto(device) {
        return {
            id: device.id,
            name: device.name,
            status: device.status,
            lastSeen: device.lastSeen,
        };
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], DevicesService);
//# sourceMappingURL=devices.service.js.map