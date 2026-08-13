import { Controller, Get, Render } from '@nestjs/common';

interface SettingsViewModel {
  appTitle: string;
  year: number;
  activeSection: 'profile' | 'account';
}

@Controller('settings')
export class SettingsController {
  @Get('profile')
  @Render('pages/settings')
  profile(): SettingsViewModel {
    return {
      appTitle: 'Demo Blog',
      year: new Date().getFullYear(),
      activeSection: 'profile',
    };
  }

  @Get('account')
  @Render('pages/settings')
  account(): SettingsViewModel {
    return {
      appTitle: 'Demo Blog',
      year: new Date().getFullYear(),
      activeSection: 'account',
    };
  }
}
