import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AutomationService } from './automation.service';
import { DatabaseService } from '../../common/database.service';
import { ConfigService } from '../../config/config.service';
import { PumpService } from '../pump/pump.service';

/**
 * Otomasyon Modülü
 * Sensör verilerine göre otomatik işlemler yönetir
 */
@Module({
  imports: [ScheduleModule.forRoot(), EventEmitterModule.forRoot()],
  providers: [AutomationService, DatabaseService, ConfigService, PumpService],
  exports: [AutomationService],
})
export class AutomationModule {}
