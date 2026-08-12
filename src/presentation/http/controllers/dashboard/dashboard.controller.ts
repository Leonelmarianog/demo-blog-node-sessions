import { Controller, Get, Render } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
  @Get()
  @Render('pages/dashboard')
  index(): { appTitle: string; year: number } {
    return { appTitle: 'Demo Blog', year: new Date().getFullYear() };
  }
}
