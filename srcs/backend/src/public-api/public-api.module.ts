import { Module } from '@nestjs/common';

import { PublicApiController } from './public-api.controller';
import { PostsModule } from '../posts/posts.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [PostsModule, ApiKeysModule],
  controllers: [PublicApiController],
})
export class PublicApiModule {}
