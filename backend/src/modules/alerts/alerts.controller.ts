import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AlertsService } from './alerts.service';
import { DevicesService } from '../devices/devices.service';

/**
 * Uyarı Kontrolcüsü
 * Kullanıcı uyarılarını API aracılığıyla sunar
 */
@Controller('alerts')
export class AlertsController {
  constructor(
    private alertsService: AlertsService,
    private devicesService: DevicesService,
  ) {}

  /**
   * GET /api/alerts/:deviceId
   * Cihaza ait son uyarıları getir
   */
  @Get(':deviceId')
  @UseGuards(AuthGuard('jwt'))
  async getAlerts(
    @Request() req: any,
    @Param('deviceId') deviceId: string,
    @Query('limit') limit?: string,
  ) {
    // Cihaz erişim kontrolü
    await this.devicesService.getDeviceById(deviceId, req.user.id);
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.alertsService.getAlerts(deviceId, parsedLimit);
  }

  /**
   * PATCH /api/alerts/:id/read
   * Uyarıyı okundu olarak işaretle
   */
  @Patch(':id/read')
  @UseGuards(AuthGuard('jwt'))
  async markAsRead(
    @Request() req: any,
    @Param('id') alertId: string,
  ) {
    // Find the alert first to verify it belongs to the user's device
    const alert = await this.alertsService.findAlertById(alertId);
    if (!alert) {
      throw new NotFoundException('Uyarı bulunamadı');
    }
    await this.devicesService.getDeviceById(alert.deviceId, req.user.id);
    return this.alertsService.markAsRead(alertId);
  }

  /**
   * PATCH /api/alerts/:deviceId/read-all
   * Cihaza ait tüm uyarıları okundu olarak işaretle
   */
  @Patch(':deviceId/read-all')
  @UseGuards(AuthGuard('jwt'))
  async markAllAsRead(
    @Request() req: any,
    @Param('deviceId') deviceId: string,
  ) {
    await this.devicesService.getDeviceById(deviceId, req.user.id);
    return this.alertsService.markAllAsRead(deviceId);
  }
}
