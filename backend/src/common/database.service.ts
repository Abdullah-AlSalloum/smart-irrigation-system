import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Veritabanı Servis
 * PostgreSQL ile bağlantı yönetimi
 */
@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✓ Veritabanı bağlantısı başarılı');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('✓ Veritabanı bağlantısı kapatıldı');
  }
}

