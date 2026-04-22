"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const config_service_1 = require("./config/config.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_service_1.ConfigService);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
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
//# sourceMappingURL=main.js.map