import { Module } from '@nestjs/common';
import { AuthController } from '@presentation/http/controllers/auth/auth.controller';

@Module({
  controllers: [AuthController],
})
export class AuthModule {}
