import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SensorGateway } from './sensor.gateway';

/**
 * WebSocket Modülü
 * Real-time iletişim yönetir
 */
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [SensorGateway],
  exports: [SensorGateway],
})
export class WebSocketModule {}
