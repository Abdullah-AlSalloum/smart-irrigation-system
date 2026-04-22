import { Module } from '@nestjs/common';
import { SensorGateway } from './sensor.gateway';

/**
 * WebSocket Modülü
 * Real-time iletişim yönetir
 */
@Module({
  providers: [SensorGateway],
  exports: [SensorGateway],
})
export class WebSocketModule {}
