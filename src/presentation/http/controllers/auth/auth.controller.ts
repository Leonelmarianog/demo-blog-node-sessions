import { Controller, Get, Render } from '@nestjs/common';

interface AuthPageViewModel {
  appTitle: string;
  year: number;
}

@Controller()
export class AuthController {
  @Get('login')
  @Render('pages/login')
  login(): AuthPageViewModel {
    return { appTitle: 'Demo Blog', year: new Date().getFullYear() };
  }

  @Get('forgot-password')
  @Render('pages/forgot-password')
  forgotPassword(): AuthPageViewModel {
    return { appTitle: 'Demo Blog', year: new Date().getFullYear() };
  }

  @Get('forgot-password/sent')
  @Render('pages/forgot-password-sent')
  forgotPasswordSent(): AuthPageViewModel {
    return { appTitle: 'Demo Blog', year: new Date().getFullYear() };
  }

  @Get('reset-password')
  @Render('pages/reset-password')
  resetPassword(): AuthPageViewModel {
    return { appTitle: 'Demo Blog', year: new Date().getFullYear() };
  }
}
