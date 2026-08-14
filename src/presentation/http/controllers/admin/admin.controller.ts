import { Controller, Get, Render } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  @Get()
  @Render('pages/admin-overview')
  index(): { appTitle: string; year: number; activeAdminNav: string } {
    return {
      appTitle: 'Demo Blog',
      year: new Date().getFullYear(),
      activeAdminNav: 'overview',
    };
  }

  @Get('posts')
  @Render('pages/admin-posts')
  posts(): { appTitle: string; year: number; activeAdminNav: string } {
    return {
      appTitle: 'Demo Blog',
      year: new Date().getFullYear(),
      activeAdminNav: 'posts',
    };
  }
}
