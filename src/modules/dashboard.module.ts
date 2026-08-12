import { Module } from '@nestjs/common';
import { DashboardController } from '@presentation/http/controllers/dashboard/dashboard.controller';

@Module({
  controllers: [DashboardController],
})
export class DashboardModule {}
