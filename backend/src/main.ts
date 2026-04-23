import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

/**
 * Uygulama Başlatma Fonksiyonu
 * Bootstrap function
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Yapılandırma servisini al
  const configService = app.get(ConfigService);

  // CORS etkinleştir
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });

  // Validation pipe'ı ekle
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API önekini ekle
  app.setGlobalPrefix('api');

  const port = configService.port;

  await app.listen(port);
  console.log(`✓ Uygulama ${port} portunda başladı`);
  console.log(`✓ WebSocket adresi: ws://localhost:${port}`);
  console.log(`✓ API adresi: http://localhost:${port}/api`);
}

bootstrap().catch(err => {
  console.error('Uygulama başlatılırken hata oluştu:', err);
  process.exit(1);
});

