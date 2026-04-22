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
exports.DevicesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const devices_service_1 = require("./devices.service");
const devices_dto_1 = require("./devices.dto");
let DevicesController = class DevicesController {
    devicesService;
    constructor(devicesService) {
        this.devicesService = devicesService;
    }
    async createDevice(req, createDeviceDto) {
        return this.devicesService.createDevice(req.user.id, createDeviceDto);
    }
    async getUserDevices(req) {
        return this.devicesService.getUserDevices(req.user.id);
    }
    async getDeviceById(req, deviceId) {
        return this.devicesService.getDeviceById(deviceId, req.user.id);
    }
    async updateDevice(req, deviceId, updateDeviceDto) {
        return this.devicesService.updateDevice(deviceId, req.user.id, updateDeviceDto);
    }
    async deleteDevice(req, deviceId) {
        return this.devicesService.deleteDevice(deviceId, req.user.id);
    }
};
exports.DevicesController = DevicesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, devices_dto_1.CreateDeviceDto]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "createDevice", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "getUserDevices", null);
__decorate([
    (0, common_1.Get)(':deviceId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "getDeviceById", null);
__decorate([
    (0, common_1.Put)(':deviceId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('deviceId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, devices_dto_1.UpdateDeviceDto]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "updateDevice", null);
__decorate([
    (0, common_1.Delete)(':deviceId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "deleteDevice", null);
exports.DevicesController = DevicesController = __decorate([
    (0, common_1.Controller)('devices'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [devices_service_1.DevicesService])
], DevicesController);
//# sourceMappingURL=devices.controller.js.map