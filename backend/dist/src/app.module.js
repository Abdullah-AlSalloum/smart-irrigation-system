"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const event_emitter_1 = require("@nestjs/event-emitter");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./modules/auth/auth.module");
const sensors_module_1 = require("./modules/sensors/sensors.module");
const devices_module_1 = require("./modules/devices/devices.module");
const pump_module_1 = require("./modules/pump/pump.module");
const websocket_module_1 = require("./modules/websocket/websocket.module");
const automation_module_1 = require("./modules/automation/automation.module");
const database_service_1 = require("./common/database.service");
const config_service_1 = require("./config/config.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            schedule_1.ScheduleModule.forRoot(),
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: false,
                delimiter: '.',
                newListener: false,
                removeListener: false,
                maxListeners: 10,
                verboseMemoryLeak: false,
                ignoreErrors: false,
            }),
            auth_module_1.AuthModule,
            sensors_module_1.SensorsModule,
            devices_module_1.DevicesModule,
            pump_module_1.PumpModule,
            websocket_module_1.WebSocketModule,
            automation_module_1.AutomationModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, database_service_1.DatabaseService, config_service_1.ConfigService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map