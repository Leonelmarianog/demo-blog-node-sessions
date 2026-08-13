import { Controller, Get, Render } from '@nestjs/common';

interface TagPageViewModel {
  appTitle: string;
  year: number;
}

@Controller('tag')
export class TagController {
  @Get(':slug')
  @Render('pages/tag')
  tag(): TagPageViewModel {
    return { appTitle: 'Demo Blog', year: new Date().getFullYear() };
  }
}
