import { config } from 'dotenv';
config();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { configureViewEngine } from '@presentation/http/views/view-engine.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  configureViewEngine(app, {
    viewsPath: join(__dirname, 'presentation', 'http', 'views'),
    publicPath: join(__dirname, '..', 'public'),
  });

  await app.listen(process.env.APP_PORT ?? 3000);
}
void bootstrap();
