import { DatabaseService } from '../../common/database.service';
import { ConfigService } from '../../config/config.service';
import { PumpService } from '../pump/pump.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class AutomationService {
    private db;
    private configService;
    private pumpService;
    private eventEmitter;
    constructor(db: DatabaseService, configService: ConfigService, pumpService: PumpService, eventEmitter: EventEmitter2);
    processAutomation(): Promise<void>;
    private processDeviceAutomation;
    private handleMoistureControl;
    private checkAndCreateAlerts;
    checkOfflineDevices(): Promise<void>;
}
