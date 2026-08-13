import { Controller, Get, Render } from '@nestjs/common';

interface ProfileViewModel {
  appTitle: string;
  year: number;
}

@Controller('u')
export class UserController {
  @Get(':username')
  @Render('pages/profile')
  profile(): ProfileViewModel {
    return { appTitle: 'Demo Blog', year: new Date().getFullYear() };
  }
}
