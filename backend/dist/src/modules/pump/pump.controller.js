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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const pump_service_1 = require("./pump.service");
const pump_dto_1 = require("./pump.dto");
const devices_service_1 = require("../devices/devices.service");
let PumpController = class PumpController {
    pumpService;
    devicesService;
    constructor(pumpService, devicesService) {
        this.pumpService = pumpService;
        this.devicesService = devicesService;
    }
    async controlPump(req, deviceId, controlPumpDto) {
        await this.devicesService.getDeviceById(deviceId, req.user.id);
        return this.pumpService.controlPump(deviceId, controlPumpDto);
    }
    async turnPumpOn(req, deviceId) {
        await this.devicesService.getDeviceById(deviceId, req.user.id);
        return this.pumpService.controlPump(deviceId, {
            action: pump_dto_1.PumpAction.ON,
            reason: 'Manuel kontrol - Pompa açıldı',
        });
    }
    async turnPumpOff(req, deviceId) {
        await this.devicesService.getDeviceById(deviceId, req.user.id);
        return this.pumpService.controlPump(deviceId, {
            action: pump_dto_1.PumpAction.OFF,
            reason: 'Manuel kontrol - Pompa kapatıldı',
        });
    }
    async getPumpStatus(req, deviceId) {
        await this.devicesService.getDeviceById(deviceId, req.user.id);
        return this.pumpService.getPumpStatus(deviceId);
    }
    async getPumpLogs(req, deviceId, limit = '50') {
        await this.devicesService.getDeviceById(deviceId, req.user.id);
        const limitNumber = Math.min(parseInt(limit) || 50, 500);
        return this.pumpService.getPumpLogs(deviceId, limitNumber);
    }
    async getPumpStatusByQuery(deviceId) {
        if (!deviceId) {
            throw new common_1.BadRequestException('deviceId parametresi gereklidir');
        }
        return this.pumpService.getPumpStatus(deviceId);
    }
};
exports.PumpController = PumpController;
__decorate([
    (0, common_1.Post)('control/:deviceId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, pump_dto_1.ControlPumpDto]),
    __metadata("design:returntype", Promise)
], PumpController.prototype, "controlPump", null);
__decorate([
    (0, common_1.Post)('on/:deviceId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PumpController.prototype, "turnPumpOn", null);
__decorate([
    (0, common_1.Post)('off/:deviceId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PumpController.prototype, "turnPumpOff", null);
__decorate([
    (0, common_1.Get)('status/:deviceId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PumpController.prototype, "getPumpStatus", null);
__decorate([
    (0, common_1.Get)('logs/:deviceId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PumpController.prototype, "getPumpLogs", null);
__decorate([
    (0, common_1.Post)('status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PumpController.prototype, "getPumpStatusByQuery", null);
exports.PumpController = PumpController = __decorate([
    (0, common_1.Controller)('api/pump'),
    __metadata("design:paramtypes", [pump_service_1.PumpService,
        devices_service_1.DevicesService])
], PumpController);
//# sourceMappingURL=pump.controller.js.map