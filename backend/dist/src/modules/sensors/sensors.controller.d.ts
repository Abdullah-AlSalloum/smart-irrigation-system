import { SensorsService } from './sensors.service';
import { CreateSensorDataDto, SensorDataResponseDto, SensorStatisticsDto } from './sensors.dto';
export declare class SensorsController {
    private sensorsService;
    constructor(sensorsService: SensorsService);
    createSensorData(deviceId: string, createSensorDataDto: CreateSensorDataDto): Promise<SensorDataResponseDto>;
    getLatestSensorData(deviceId: string, limit?: string): Promise<SensorDataResponseDto[]>;
    getSensorStatistics(deviceId: string, hours?: string): Promise<SensorStatisticsDto>;
}
