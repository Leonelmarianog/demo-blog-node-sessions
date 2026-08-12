import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { configureViewEngine } from '../../src/presentation/http/views/view-engine.config';

export function setupApp(app: INestApplication): void {
  configureViewEngine(app as NestExpressApplication, {
    viewsPath: join(
      __dirname,
      '..',
      '..',
      'src',
      'presentation',
      'http',
      'views',
    ),
    publicPath: join(__dirname, '..', '..', 'public'),
  });
}
