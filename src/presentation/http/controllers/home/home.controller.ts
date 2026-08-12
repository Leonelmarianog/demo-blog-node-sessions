import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class HomeController {
  @Get()
  @Render('pages/home')
  root(): { appTitle: string; year: number } {
    return { appTitle: 'Demo Blog', year: new Date().getFullYear() };
  }
}
