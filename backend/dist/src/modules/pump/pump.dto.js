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
exports.PumpLogDto = exports.PumpStatusResponseDto = exports.ControlPumpDto = exports.PumpAction = void 0;
const class_validator_1 = require("class-validator");
var PumpAction;
(function (PumpAction) {
    PumpAction["ON"] = "ON";
    PumpAction["OFF"] = "OFF";
})(PumpAction || (exports.PumpAction = PumpAction = {}));
class ControlPumpDto {
    action;
    reason;
}
exports.ControlPumpDto = ControlPumpDto;
__decorate([
    (0, class_validator_1.IsEnum)(PumpAction),
    __metadata("design:type", String)
], ControlPumpDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ControlPumpDto.prototype, "reason", void 0);
class PumpStatusResponseDto {
    deviceId;
    status;
    lastAction;
    lastReason;
}
exports.PumpStatusResponseDto = PumpStatusResponseDto;
class PumpLogDto {
    id;
    deviceId;
    action;
    reason;
    timestamp;
}
exports.PumpLogDto = PumpLogDto;
//# sourceMappingURL=pump.dto.js.map