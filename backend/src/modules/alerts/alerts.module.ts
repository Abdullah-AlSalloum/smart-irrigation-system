import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { DatabaseService } from '../../common/database.service';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [DevicesModule],
  controllers: [AlertsController],
  providers: [AlertsService, DatabaseService],
  exports: [AlertsService],
})
export class AlertsModule {}
