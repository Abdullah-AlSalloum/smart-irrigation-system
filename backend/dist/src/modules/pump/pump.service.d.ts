import { DatabaseService } from '../../common/database.service';
import { ControlPumpDto, PumpStatusResponseDto, PumpLogDto } from './pump.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class PumpService {
    private db;
    private eventEmitter;
    private pumpStates;
    constructor(db: DatabaseService, eventEmitter: EventEmitter2);
    controlPump(deviceId: string, controlPumpDto: ControlPumpDto): Promise<PumpStatusResponseDto>;
    getPumpStatus(deviceId: string): Promise<PumpStatusResponseDto>;
    getPumpLogs(deviceId: string, limit?: number): Promise<PumpLogDto[]>;
    autoControlPump(deviceId: string, action: string, reason: string): Promise<void>;
}
