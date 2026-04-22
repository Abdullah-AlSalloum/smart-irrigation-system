export declare class CreateSensorDataDto {
    moisture: number;
    temperature: number;
    ph: number;
}
export declare class SensorDataResponseDto {
    id: string;
    deviceId: string;
    moisture: number;
    temperature: number;
    ph: number;
    createdAt: Date;
}
export declare class SensorStatisticsDto {
    averageMoisture: number;
    averageTemperature: number;
    averagePh: number;
    latestData: SensorDataResponseDto;
    dataCount: number;
}
