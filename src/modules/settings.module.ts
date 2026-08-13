import { Module } from '@nestjs/common';
import { SettingsController } from '@presentation/http/controllers/settings/settings.controller';

@Module({
  controllers: [SettingsController],
})
export class SettingsModule {}
