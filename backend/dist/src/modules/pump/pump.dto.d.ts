export declare enum PumpAction {
    ON = "ON",
    OFF = "OFF"
}
export declare class ControlPumpDto {
    action: PumpAction;
    reason: string;
}
export declare class PumpStatusResponseDto {
    deviceId: string;
    status: string;
    lastAction: Date;
    lastReason: string;
}
export declare class PumpLogDto {
    id: string;
    deviceId: string;
    action: string;
    reason: string;
    timestamp: Date;
}
