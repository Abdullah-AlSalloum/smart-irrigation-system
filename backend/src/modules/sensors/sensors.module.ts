import { Module } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { SensorsController } from './sensors.controller';
import { DatabaseService } from '../../common/database.service';

/**
 * Sensör Modülü
 * Sensör verisi işlemlerini yönetir
 */
@Module({
  providers: [SensorsService, DatabaseService],
  controllers: [SensorsController],
  exports: [SensorsService],
})
export class SensorsModule {}
