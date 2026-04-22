export declare class CreateDeviceDto {
    name: string;
    description?: string;
}
export declare class UpdateDeviceDto {
    name?: string;
    status?: string;
}
export declare class DeviceResponseDto {
    id: string;
    name: string;
    status: string;
    lastSeen: Date;
    createdAt?: Date;
}
