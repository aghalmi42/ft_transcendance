
import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('posts/:postId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  togglePostLike(
    @CurrentUser() user: User,
    @Param('postId') postId: string,
  ) {
    return this.likesService.togglePostLike(user, postId);
  }

  @Get('posts/:postId/likes')
  findPostLikers(@Param('postId') postId: string) {
    return this.likesService.findPostLikers(postId);
  }

  @Post('comments/:commentId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggleCommentLike(
    @CurrentUser() user: User,
    @Param('commentId') commentId: string,
  ) {
    return this.likesService.toggleCommentLike(user, commentId);
  }

  @Get('comments/:commentId/likes')
  findCommentLikers(@Param('commentId') commentId: string) {
    return this.likesService.findCommentLikers(commentId);
  }
}