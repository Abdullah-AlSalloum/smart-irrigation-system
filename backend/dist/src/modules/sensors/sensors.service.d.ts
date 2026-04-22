import { DatabaseService } from '../../common/database.service';
import { CreateSensorDataDto, SensorDataResponseDto, SensorStatisticsDto } from './sensors.dto';
export declare class SensorsService {
    private db;
    constructor(db: DatabaseService);
    createSensorData(deviceId: string, createSensorDataDto: CreateSensorDataDto): Promise<SensorDataResponseDto>;
    getLatestSensorData(deviceId: string, limit?: number): Promise<SensorDataResponseDto[]>;
    getSensorStatistics(deviceId: string, hours?: number): Promise<SensorStatisticsDto>;
    private validateSensorData;
    private mapToResponseDto;
}
