import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database.service';

@Injectable()
export class AlertsService {
  constructor(private db: DatabaseService) {}

  async getAlerts(deviceId: string, limit = 50) {
    return this.db.alert.findMany({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findAlertById(id: string) {
    return this.db.alert.findUnique({ where: { id } });
  }

  async markAsRead(id: string) {
    return this.db.alert.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(deviceId: string) {
    return this.db.alert.updateMany({
      where: { deviceId, isRead: false },
      data: { isRead: true },
    });
  }
}
