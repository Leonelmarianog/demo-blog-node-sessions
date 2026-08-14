import { Controller, Get, Render } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  @Get()
  @Render('pages/admin-overview')
  index(): { appTitle: string; year: number } {
    return { appTitle: 'Demo Blog', year: new Date().getFullYear() };
  }
}
