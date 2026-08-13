import { Module } from '@nestjs/common';
import { SearchController } from '@presentation/http/controllers/search/search.controller';

@Module({
  controllers: [SearchController],
})
export class SearchModule {}
