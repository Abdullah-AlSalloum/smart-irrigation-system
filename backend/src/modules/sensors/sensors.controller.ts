import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SensorsService } from './sensors.service';
import { CreateSensorDataDto, SensorDataResponseDto, SensorStatisticsDto } from './sensors.dto';

/**
 * Sensör Kontrolcüsü
 * Sensör verisi işlemlerini API aracılığıyla sunma
 */
@Controller('sensors')
export class SensorsController {
  constructor(private sensorsService: SensorsService) {}

  /**
   * POST /api/sensors
   * Yeni sensör verisi oluştur (ESP32'den)
   * Public endpoint - deviceId üzerinden erişim
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSensorData(
    @Query('deviceId') deviceId: string,
    @Body() createSensorDataDto: CreateSensorDataDto,
  ): Promise<SensorDataResponseDto> {
    if (!deviceId) {
      throw new BadRequestException('deviceId parametresi gereklidir');
    }
    return this.sensorsService.createSensorData(deviceId, createSensorDataDto);
  }

  /**
   * POST /api/sensors/:deviceId/test
   * Secili cihaz icin test sensör verisi üretir
   */
  @Post(':deviceId/test')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async createTestSensorData(
    @Param('deviceId') deviceId: string,
    @Request() req: any,
  ): Promise<SensorDataResponseDto> {
    return this.sensorsService.createTestSensorData(deviceId, req.user.id);
  }

  /**
   * GET /api/sensors/:deviceId
   * Cihazın son sensör verilerini getir
   */
  @Get(':deviceId')
  @UseGuards(AuthGuard('jwt'))
  async getLatestSensorData(
    @Param('deviceId') deviceId: string,
    @Query('limit') limit: string = '100',
  ): Promise<SensorDataResponseDto[]> {
    const limitNumber = Math.min(parseInt(limit) || 100, 500);
    return this.sensorsService.getLatestSensorData(deviceId, limitNumber);
  }

  /**
   * GET /api/sensors/:deviceId/statistics
   * Sensör istatistiklerini getir
   */
  @Get(':deviceId/statistics')
  @UseGuards(AuthGuard('jwt'))
  async getSensorStatistics(
    @Param('deviceId') deviceId: string,
    @Query('hours') hours: string = '24',
  ): Promise<SensorStatisticsDto> {
    const hoursNumber = Math.min(parseInt(hours) || 24, 720);
    return this.sensorsService.getSensorStatistics(deviceId, hoursNumber);
  }
}
