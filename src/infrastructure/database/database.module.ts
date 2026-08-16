import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database:
          config.get<string>('NODE_ENV') === 'test'
            ? config.get<string>('DB_TEST_NAME')
            : config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        migrations: ['src/infrastructure/database/migrations/*.{ts,js}'],
        migrationsRun: false,
        migrationsTransactionMode: 'all',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
