import { DevicesService } from './devices.service';
import { CreateDeviceDto, UpdateDeviceDto, DeviceResponseDto } from './devices.dto';
export declare class DevicesController {
    private devicesService;
    constructor(devicesService: DevicesService);
    createDevice(req: any, createDeviceDto: CreateDeviceDto): Promise<DeviceResponseDto>;
    getUserDevices(req: any): Promise<DeviceResponseDto[]>;
    getDeviceById(req: any, deviceId: string): Promise<DeviceResponseDto>;
    updateDevice(req: any, deviceId: string, updateDeviceDto: UpdateDeviceDto): Promise<DeviceResponseDto>;
    deleteDevice(req: any, deviceId: string): Promise<void>;
}
