import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/enums/notification-type.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly notificationsService: NotificationsService,
  ) {}

async create(
  author: User,
  postId: string,
  createCommentDto: CreateCommentDto,
): Promise<Comment> {
  const post = await this.postsRepository.findOne({
    where: { id: postId },
    relations: ['author'],
  });
  if (!post) {
    throw new NotFoundException('Post introuvable.');
  }
  const comment = this.commentsRepository.create({
    content: createCommentDto.content,
    author,
    post,
  });
  const saved = await this.commentsRepository.save(comment);

  await this.notificationsService.create({
    recipient: post.author,
    actor: author,
    type: NotificationType.POST_COMMENTED,
    entityId: post.id,
  });

  return saved;
}

  async findAllByPost(postId: string): Promise<Comment[]> {
    const post = await this.postsRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException('Post introuvable.');
    }
    return this.commentsRepository.find({
      where: { post: { id: postId } },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOneById(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author', 'post'],
    });
    if (!comment) {
      throw new NotFoundException('Commentaire introuvable.');
    }
    return comment;
  }

  async update(
    user: User,
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.findOneById(id);
    if (comment.author.id !== user.id) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres commentaires.',
      );
    }
    Object.assign(comment, updateCommentDto);
    return this.commentsRepository.save(comment);
  }

  async remove(user: User, id: string): Promise<void> {
    const comment = await this.findOneById(id);
    if (comment.author.id !== user.id) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres commentaires.',
      );
    }
    await this.commentsRepository.softDelete(id);
  }
}