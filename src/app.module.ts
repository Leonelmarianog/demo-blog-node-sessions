import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { HomeModule } from '@modules/home.module';
import { PostsModule } from '@modules/posts.module';
import { DashboardModule } from '@modules/dashboard.module';
import { AuthModule } from '@modules/auth.module';
import { SearchModule } from '@modules/search.module';
import { TagModule } from '@modules/tag.module';
import { UserModule } from '@modules/user.module';
import { SettingsModule } from '@modules/settings.module';
import { AdminModule } from '@modules/admin.module';
import { NotFoundExceptionFilter } from '@presentation/http/exceptions/not-found.exception.filter';
import { CurrentUserMiddleware } from '@presentation/http/middleware/current-user.middleware';
import { RememberMeRestoreMiddleware } from '@presentation/http/middleware/remember-me-restore.middleware';
import { RequireSessionMiddleware } from '@presentation/http/middleware/require-session.middleware';
import { DashboardController } from '@presentation/http/controllers/dashboard/dashboard.controller';
import { AdminController } from '@presentation/http/controllers/admin/admin.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envSchema,
      validationOptions: { abortEarly: false, allowUnknown: true },
    }),
    DatabaseModule,
    HomeModule,
    PostsModule,
    DashboardModule,
    AuthModule,
    SearchModule,
    TagModule,
    UserModule,
    SettingsModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RememberMeRestoreMiddleware, CurrentUserMiddleware)
      .forRoutes('*');
    consumer
      .apply(RequireSessionMiddleware)
      .forRoutes(
        DashboardController,
        AdminController,
        'posts/new',
        'posts/:slug/edit',
      );
  }
}
