"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const event_emitter_1 = require("@nestjs/event-emitter");
const automation_service_1 = require("./automation.service");
const database_service_1 = require("../../common/database.service");
const config_service_1 = require("../../config/config.service");
const pump_service_1 = require("../pump/pump.service");
let AutomationModule = class AutomationModule {
};
exports.AutomationModule = AutomationModule;
exports.AutomationModule = AutomationModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot(), event_emitter_1.EventEmitterModule.forRoot()],
        providers: [automation_service_1.AutomationService, database_service_1.DatabaseService, config_service_1.ConfigService, pump_service_1.PumpService],
        exports: [automation_service_1.AutomationService],
    })
], AutomationModule);
//# sourceMappingURL=automation.module.js.map