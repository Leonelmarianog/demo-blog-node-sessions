import { NestExpressApplication } from '@nestjs/platform-express';
import { create } from 'express-handlebars';
import { join } from 'node:path';

export function configureViewEngine(
  app: NestExpressApplication,
  paths: { viewsPath: string; publicPath: string },
): void {
  app.useStaticAssets(paths.publicPath);
  app.setBaseViewsDir(paths.viewsPath);

  const hbs = create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: join(paths.viewsPath, 'layouts'),
    partialsDir: join(paths.viewsPath, 'partials'),
  });

  // NestExpressApplication doesn't expose .engine(); configure it on the raw Express instance.
  app.getHttpAdapter().getInstance().engine('hbs', hbs.engine);
  app.setViewEngine('hbs');
}