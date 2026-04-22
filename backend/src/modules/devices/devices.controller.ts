import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DevicesService } from './devices.service';
import { CreateDeviceDto, UpdateDeviceDto, DeviceResponseDto } from './devices.dto';

/**
 * Cihaz Kontrolcüsü
 * Cihaz işlemlerini API aracılığıyla sunma
 */
@Controller('api/devices')
@UseGuards(AuthGuard('jwt'))
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  /**
   * POST /api/devices
   * Yeni cihaz oluştur
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDevice(
    @Request() req: any,
    @Body() createDeviceDto: CreateDeviceDto,
  ): Promise<DeviceResponseDto> {
    return this.devicesService.createDevice(req.user.id, createDeviceDto);
  }

  /**
   * GET /api/devices
   * Kullanıcının cihazlarını listele
   */
  @Get()
  async getUserDevices(@Request() req: any): Promise<DeviceResponseDto[]> {
    return this.devicesService.getUserDevices(req.user.id);
  }

  /**
   * GET /api/devices/:deviceId
   * Belirli cihazı getir
   */
  @Get(':deviceId')
  async getDeviceById(
    @Request() req: any,
    @Param('deviceId') deviceId: string,
  ): Promise<DeviceResponseDto> {
    return this.devicesService.getDeviceById(deviceId, req.user.id);
  }

  /**
   * PUT /api/devices/:deviceId
   * Cihazı güncelle
   */
  @Put(':deviceId')
  async updateDevice(
    @Request() req: any,
    @Param('deviceId') deviceId: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceResponseDto> {
    return this.devicesService.updateDevice(deviceId, req.user.id, updateDeviceDto);
  }

  /**
   * DELETE /api/devices/:deviceId
   * Cihazı sil
   */
  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevice(
    @Request() req: any,
    @Param('deviceId') deviceId: string,
  ): Promise<void> {
    return this.devicesService.deleteDevice(deviceId, req.user.id);
  }
}
