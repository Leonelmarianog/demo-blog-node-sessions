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
    helpers: {
      // View-layer equality check for `{{#if (eq a b)}}` — Handlebars has no built-in.
      eq: (a: unknown, b: unknown): boolean => a === b,
    },
  });

  // NestExpressApplication doesn't expose .engine(); configure it on the raw Express instance.
  // express-handlebars' engine returns a Promise; Express's engine() callback type expects
  // void, but this is the intended express-handlebars wiring.
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.getHttpAdapter().getInstance().engine('hbs', hbs.engine);
  app.setViewEngine('hbs');
}
