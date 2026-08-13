import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';
import { HomeModule } from '@modules/home.module';
import { PostsModule } from '@modules/posts.module';
import { DashboardModule } from '@modules/dashboard.module';
import { AuthModule } from '@modules/auth.module';
import { SearchModule } from '@modules/search.module';
import { NotFoundExceptionFilter } from '@presentation/http/exceptions/not-found.exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env' : '.env',
      validationSchema: envSchema,
    }),
    HomeModule,
    PostsModule,
    DashboardModule,
    AuthModule,
    SearchModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter,
    },
  ],
})
export class AppModule {}
