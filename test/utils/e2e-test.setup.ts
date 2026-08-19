import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { configureViewEngine } from '../../src/presentation/http/views/view-engine.config';
import { buildSessionMiddleware } from '../../src/infrastructure/session/session.middleware';

export async function setupApp(app: INestApplication): Promise<void> {
  const expressApp = app as NestExpressApplication;
  expressApp.use(await buildSessionMiddleware());
  configureViewEngine(expressApp, {
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
