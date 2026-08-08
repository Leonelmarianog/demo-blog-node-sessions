import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';
import { HomeModule } from '@modules/home.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env' : '.env',
      validationSchema: envSchema,
    }),
    HomeModule,
  ],
})
export class AppModule {}