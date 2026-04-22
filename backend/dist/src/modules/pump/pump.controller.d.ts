import { PumpService } from './pump.service';
import { ControlPumpDto, PumpStatusResponseDto, PumpLogDto } from './pump.dto';
import { DevicesService } from '../devices/devices.service';
export declare class PumpController {
    private pumpService;
    private devicesService;
    constructor(pumpService: PumpService, devicesService: DevicesService);
    controlPump(req: any, deviceId: string, controlPumpDto: ControlPumpDto): Promise<PumpStatusResponseDto>;
    turnPumpOn(req: any, deviceId: string): Promise<PumpStatusResponseDto>;
    turnPumpOff(req: any, deviceId: string): Promise<PumpStatusResponseDto>;
    getPumpStatus(req: any, deviceId: string): Promise<PumpStatusResponseDto>;
    getPumpLogs(req: any, deviceId: string, limit?: string): Promise<PumpLogDto[]>;
    getPumpStatusByQuery(deviceId: string): Promise<PumpStatusResponseDto>;
}
