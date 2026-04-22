import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Prisma Veritabanı Servis
 * PostgreSQL ile bağlantı yönetimi
 */
@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL tanimlanmamis. Lutfen .env dosyasini kontrol edin.');
    }

    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
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

