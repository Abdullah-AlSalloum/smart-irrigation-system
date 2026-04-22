import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PumpService } from './pump.service';
import { PumpController } from './pump.controller';
import { DatabaseService } from '../../common/database.service';
import { DevicesService } from '../devices/devices.service';

/**
 * Pompa Modülü
 * Pompa kontrol işlemlerini yönetir
 */
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [PumpService, DatabaseService, DevicesService],
  controllers: [PumpController],
  exports: [PumpService],
})
export class PumpModule {}
