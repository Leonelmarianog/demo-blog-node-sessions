import { config } from 'dotenv';
config();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { configureViewEngine } from '@presentation/http/views/view-engine.config';
import { buildSessionMiddleware } from '@infrastructure/session/session.middleware';
import cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.use(await buildSessionMiddleware());

  configureViewEngine(app, {
    viewsPath: join(__dirname, 'presentation', 'http', 'views'),
    publicPath: join(__dirname, '..', 'public'),
  });

  await app.listen(process.env.APP_PORT!);
}
void bootstrap();
