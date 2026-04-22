import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { DatabaseService } from '../../common/database.service';

/**
 * Cihaz Modülü
 * Cihaz işlemlerini yönetir
 */
@Module({
  providers: [DevicesService, DatabaseService],
  controllers: [DevicesController],
  exports: [DevicesService],
})
export class DevicesModule {}
