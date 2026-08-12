import { Module } from '@nestjs/common';
import { PostsController } from '@presentation/http/controllers/posts/posts.controller';

@Module({
  controllers: [PostsController],
})
export class PostsModule {}
