
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLike } from './entities/post-like.entity';
import { CommentLike } from './entities/comment-like.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/enums/notification-type.enum';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikesRepository: Repository<PostLike>,
    @InjectRepository(CommentLike)
    private readonly commentLikesRepository: Repository<CommentLike>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async togglePostLike(
    user: User,
    postId: string,
  ): Promise<{ liked: boolean; count: number }> {
    const post = await this.postsRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException('Post introuvable.');
    }

    const existing = await this.postLikesRepository.findOne({
      where: { user: { id: user.id }, post: { id: postId } },
    });

    if (existing) {
      await this.postLikesRepository.remove(existing);
      const count = await this.countPostLikes(postId);
      return { liked: false, count };
    }

    const like = this.postLikesRepository.create({ user, post });
    await this.postLikesRepository.save(like);

    await this.notificationsService.create({
    recipient: post.author,
    actor: user,
    type: NotificationType.POST_LIKED,
    entityId: post.id,
  });

    const count = await this.countPostLikes(postId);
    return { liked: true, count };
  }

  async countPostLikes(postId: string): Promise<number> {
    return this.postLikesRepository.count({
      where: { post: { id: postId } },
    });
  }

  async findPostLikers(postId: string): Promise<User[]> {
    const post = await this.postsRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException('Post introuvable.');
    }
    const likes = await this.postLikesRepository.find({
      where: { post: { id: postId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return likes.map((like) => like.user);
  }

  async toggleCommentLike(
    user: User,
    commentId: string,
  ): Promise<{ liked: boolean; count: number }> {
    const comment = await this.commentsRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new NotFoundException('Commentaire introuvable.');
    }

    const existing = await this.commentLikesRepository.findOne({
      where: { user: { id: user.id }, comment: { id: commentId } },
    });

    if (existing) {
      await this.commentLikesRepository.remove(existing);
      const count = await this.countCommentLikes(commentId);
      return { liked: false, count };
    }

    const like = this.commentLikesRepository.create({ user, comment });
    await this.commentLikesRepository.save(like);

    await this.notificationsService.create({
    recipient: comment.author,
    actor: user,
    type: NotificationType.COMMENT_LIKED,
    entityId: comment.id,
  });

    const count = await this.countCommentLikes(commentId);
    return { liked: true, count };
  }

  async countCommentLikes(commentId: string): Promise<number> {
    return this.commentLikesRepository.count({
      where: { comment: { id: commentId } },
    });
  }

  async findCommentLikers(commentId: string): Promise<User[]> {
    const comment = await this.commentsRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new NotFoundException('Commentaire introuvable.');
    }
    const likes = await this.commentLikesRepository.find({
      where: { comment: { id: commentId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return likes.map((like) => like.user);
  }
}
