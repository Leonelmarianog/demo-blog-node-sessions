import { Controller, Get, Render } from '@nestjs/common';

interface SearchResultsViewModel {
  appTitle: string;
  year: number;
  activeTab: 'posts' | 'tags';
}

@Controller('search')
export class SearchController {
  @Get('posts')
  @Render('pages/search-results')
  posts(): SearchResultsViewModel {
    return {
      appTitle: 'Demo Blog',
      year: new Date().getFullYear(),
      activeTab: 'posts',
    };
  }

  @Get('tags')
  @Render('pages/search-results')
  tags(): SearchResultsViewModel {
    return {
      appTitle: 'Demo Blog',
      year: new Date().getFullYear(),
      activeTab: 'tags',
    };
  }
}
