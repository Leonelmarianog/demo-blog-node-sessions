import { Controller, Get, Render } from '@nestjs/common';

@Controller('posts')
export class PostsController {
  @Get(':slug')
  @Render('pages/post-detail')
  detail(): { appTitle: string; year: number } {
    return { appTitle: 'Demo Blog', year: new Date().getFullYear() };
  }
}
