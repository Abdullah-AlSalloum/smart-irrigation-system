import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PumpService } from './pump.service';
import { ControlPumpDto, PumpStatusResponseDto, PumpLogDto, PumpAction } from './pump.dto';
import { DevicesService } from '../devices/devices.service';

/**
 * Pompa Kontrolcüsü
 * Pompa kontrol işlemlerini API aracılığıyla sunma
 */
@Controller('api/pump')
export class PumpController {
  constructor(
    private pumpService: PumpService,
    private devicesService: DevicesService,
  ) {}

  /**
   * POST /api/pump/control/:deviceId
   * Pompayı kontrol et (ON/OFF)
   */
  @Post('control/:deviceId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async controlPump(
    @Request() req: any,
    @Param('deviceId') deviceId: string,
    @Body() controlPumpDto: ControlPumpDto,
  ): Promise<PumpStatusResponseDto> {
    // Cihaza erişimi kontrol et
    await this.devicesService.getDeviceById(deviceId, req.user.id);
    return this.pumpService.controlPump(deviceId, controlPumpDto);
  }

  /**
   * POST /api/pump/on/:deviceId
   * Pompayı aç (Shortcut endpoint)
   */
  @Post('on/:deviceId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async turnPumpOn(
    @Request() req: any,
    @Param('deviceId') deviceId: string,
  ): Promise<PumpStatusResponseDto> {
    // Cihaza erişimi kontrol et
    await this.devicesService.getDeviceById(deviceId, req.user.id);
    return this.pumpService.controlPump(deviceId, {
      action: PumpAction.ON,
      reason: 'Manuel kontrol - Pompa açıldı',
    });
  }

  /**
   * POST /api/pump/off/:deviceId
   * Pompayı kapat (Shortcut endpoint)
   */
  @Post('off/:deviceId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async turnPumpOff(
    @Request() req: any,
    @Param('deviceId') deviceId: string,
  ): Promise<PumpStatusResponseDto> {
    // Cihaza erişimi kontrol et
    await this.devicesService.getDeviceById(deviceId, req.user.id);
    return this.pumpService.controlPump(deviceId, {
      action: PumpAction.OFF,
      reason: 'Manuel kontrol - Pompa kapatıldı',
    });
  }

  /**
   * GET /api/pump/status/:deviceId
   * Pompa durumunu getir
   */
  @Get('status/:deviceId')
  @UseGuards(AuthGuard('jwt'))
  async getPumpStatus(
    @Request() req: any,
    @Param('deviceId') deviceId: string,
  ): Promise<PumpStatusResponseDto> {
    // Cihaza erişimi kontrol et
    await this.devicesService.getDeviceById(deviceId, req.user.id);
    return this.pumpService.getPumpStatus(deviceId);
  }

  /**
   * GET /api/pump/logs/:deviceId
   * Pompa loglarını getir
   */
  @Get('logs/:deviceId')
  @UseGuards(AuthGuard('jwt'))
  async getPumpLogs(
    @Request() req: any,
    @Param('deviceId') deviceId: string,
    @Query('limit') limit: string = '50',
  ): Promise<PumpLogDto[]> {
    // Cihaza erişimi kontrol et
    await this.devicesService.getDeviceById(deviceId, req.user.id);

    const limitNumber = Math.min(parseInt(limit) || 50, 500);
    return this.pumpService.getPumpLogs(deviceId, limitNumber);
  }

  /**
   * POST /api/pump/status
   * Pompa durumunu getir (Query parametresiyle - ESP32 için)
   * Public endpoint
   */
  @Post('status')
  @HttpCode(HttpStatus.OK)
  async getPumpStatusByQuery(@Query('deviceId') deviceId: string): Promise<PumpStatusResponseDto> {
    if (!deviceId) {
      throw new BadRequestException('deviceId parametresi gereklidir');
    }
    return this.pumpService.getPumpStatus(deviceId);
  }
}
