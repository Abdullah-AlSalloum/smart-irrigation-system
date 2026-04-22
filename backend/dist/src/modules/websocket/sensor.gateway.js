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
var SensorGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const event_emitter_1 = require("@nestjs/event-emitter");
const common_1 = require("@nestjs/common");
let SensorGateway = SensorGateway_1 = class SensorGateway {
    server;
    logger = new common_1.Logger(SensorGateway_1.name);
    clientsByDevice = new Map();
    handleConnection(client) {
        this.logger.log(`İstemci bağlandı: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`İstemci ayrıldı: ${client.id}`);
        for (const [deviceId, clients] of this.clientsByDevice.entries()) {
            clients.delete(client.id);
            if (clients.size === 0) {
                this.clientsByDevice.delete(deviceId);
            }
        }
    }
    handleSubscribe(client, data) {
        const { deviceId } = data;
        if (!deviceId) {
            client.emit('error', { message: 'deviceId gereklidir' });
            return;
        }
        if (!this.clientsByDevice.has(deviceId)) {
            this.clientsByDevice.set(deviceId, new Set());
        }
        const clients = this.clientsByDevice.get(deviceId);
        if (!clients) {
            client.emit('error', { message: 'Abonelik durumu oluşturulamadı' });
            return;
        }
        clients.add(client.id);
        client.join(`device-${deviceId}`);
        this.logger.log(`İstemci ${client.id} cihaz ${deviceId} için abone oldu`);
        client.emit('subscribed', { deviceId });
    }
    handleUnsubscribe(client, data) {
        const { deviceId } = data;
        const clients = this.clientsByDevice.get(deviceId);
        if (clients) {
            clients.delete(client.id);
            if (clients.size === 0) {
                this.clientsByDevice.delete(deviceId);
            }
        }
        client.leave(`device-${deviceId}`);
        this.logger.log(`İstemci ${client.id} cihaz ${deviceId} için abonelikten çıktı`);
    }
    handleSensorDataReceived(payload) {
        const { deviceId, moisture, temperature, ph, createdAt } = payload;
        this.server.to(`device-${deviceId}`).emit('sensor-data', {
            deviceId,
            moisture,
            temperature,
            ph,
            createdAt,
            timestamp: new Date(),
        });
    }
    handlePumpStatusChanged(payload) {
        const { deviceId, status, lastAction, lastReason } = payload;
        this.server.to(`device-${deviceId}`).emit('pump-status', {
            deviceId,
            status,
            lastAction,
            lastReason,
            timestamp: new Date(),
        });
        this.server.emit('pump-status-updated', {
            deviceId,
            status,
        });
    }
    handleAlertCreated(payload) {
        const { deviceId, type, message, severity } = payload;
        this.server.to(`device-${deviceId}`).emit('alert', {
            deviceId,
            type,
            message,
            severity,
            timestamp: new Date(),
        });
    }
    handleDeviceOffline(payload) {
        const { deviceId, deviceName } = payload;
        this.server.emit('device-offline', {
            deviceId,
            deviceName,
            timestamp: new Date(),
        });
    }
    handleAutomationAction(payload) {
        const { deviceId, type, action, reason } = payload;
        this.server.to(`device-${deviceId}`).emit('automation-action', {
            deviceId,
            type,
            action,
            reason,
            timestamp: new Date(),
        });
    }
    handleMessage(client, data) {
        const { deviceId, message } = data;
        this.server.to(`device-${deviceId}`).emit('message', {
            deviceId,
            message,
            timestamp: new Date(),
        });
    }
};
exports.SensorGateway = SensorGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SensorGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], SensorGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], SensorGateway.prototype, "handleUnsubscribe", null);
__decorate([
    (0, event_emitter_1.OnEvent)('sensor.data.received'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SensorGateway.prototype, "handleSensorDataReceived", null);
__decorate([
    (0, event_emitter_1.OnEvent)('pump.status.changed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SensorGateway.prototype, "handlePumpStatusChanged", null);
__decorate([
    (0, event_emitter_1.OnEvent)('alert.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SensorGateway.prototype, "handleAlertCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('device.offline'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SensorGateway.prototype, "handleDeviceOffline", null);
__decorate([
    (0, event_emitter_1.OnEvent)('automation.action'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SensorGateway.prototype, "handleAutomationAction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], SensorGateway.prototype, "handleMessage", null);
exports.SensorGateway = SensorGateway = SensorGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], SensorGateway);
//# sourceMappingURL=sensor.gateway.js.map