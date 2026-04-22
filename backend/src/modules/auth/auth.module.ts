import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '../../config/config.service';
import { DatabaseService } from '../../common/database.service';

/**
 * Kimlik Doğrulama Modülü
 * JWT tabanlı kimlik doğrulama işlemlerini sağlar
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: {
          expiresIn: 86400, // 24 hours in seconds
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, ConfigService, DatabaseService],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule, AuthService],
})
export class AuthModule {}
