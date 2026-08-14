import { Module } from '@nestjs/common';
import { AdminController } from '@presentation/http/controllers/admin/admin.controller';

@Module({
  controllers: [AdminController],
})
export class AdminModule {}
