import { Module } from '@nestjs/common';
import { HomeController } from '@presentation/http/controllers/home/home.controller';

@Module({
  controllers: [HomeController],
})
export class HomeModule {}
