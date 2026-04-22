import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { SensorsModule } from './modules/sensors/sensors.module';
import { DevicesModule } from './modules/devices/devices.module';
import { PumpModule } from './modules/pump/pump.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { AutomationModule } from './modules/automation/automation.module';
import { DatabaseService } from './common/database.service';
import { ConfigService } from './config/config.service';

/**
 * Ana Uygulama Modülü
 * Tüm modülleri bir araya getirir
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    AuthModule,
    SensorsModule,
    DevicesModule,
    PumpModule,
    WebSocketModule,
    AutomationModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService, ConfigService],
})
export class AppModule {}
