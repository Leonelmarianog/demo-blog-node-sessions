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

  @Get('comments')
  @Render('pages/admin-comments')
  comments(): { appTitle: string; year: number; activeAdminNav: string } {
    return {
      appTitle: 'Demo Blog',
      year: new Date().getFullYear(),
      activeAdminNav: 'comments',
    };
  }

  @Get('users')
  @Render('pages/admin-users')
  users(): { appTitle: string; year: number; activeAdminNav: string } {
    return {
      appTitle: 'Demo Blog',
      year: new Date().getFullYear(),
      activeAdminNav: 'users',
    };
  }
}
