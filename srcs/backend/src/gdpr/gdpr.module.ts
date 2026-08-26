import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';

import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { PostLike } from '../likes/entities/post-like.entity';
import { CommentLike } from '../likes/entities/comment-like.entity';
import { Friendship } from '../friends/entities/friends.entity';
import { GameResult } from '../games/entities/game-result.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Message } from '../chat/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Post,
      Comment,
      PostLike,
      CommentLike,
      Friendship,
      GameResult,
      Notification,
      Message,
    ]),
  ],
  controllers: [GdprController],
  providers: [GdprService],
})
export class GdprModule {}
