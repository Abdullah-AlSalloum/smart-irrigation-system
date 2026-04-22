import { DatabaseService } from '../../common/database.service';
import { CreateDeviceDto, UpdateDeviceDto, DeviceResponseDto } from './devices.dto';
export declare class DevicesService {
    private db;
    constructor(db: DatabaseService);
    createDevice(userId: string, createDeviceDto: CreateDeviceDto): Promise<DeviceResponseDto>;
    getUserDevices(userId: string): Promise<DeviceResponseDto[]>;
    getDeviceById(deviceId: string, userId: string): Promise<DeviceResponseDto>;
    updateDevice(deviceId: string, userId: string, updateDeviceDto: UpdateDeviceDto): Promise<DeviceResponseDto>;
    deleteDevice(deviceId: string, userId: string): Promise<void>;
    updateDeviceStatus(deviceId: string, status: string): Promise<void>;
    private mapToResponseDto;
}
