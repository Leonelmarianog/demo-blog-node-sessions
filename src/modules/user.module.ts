import { Module } from '@nestjs/common';
import { UserController } from '@presentation/http/controllers/user/user.controller';

@Module({
  controllers: [UserController],
})
export class UserModule {}
