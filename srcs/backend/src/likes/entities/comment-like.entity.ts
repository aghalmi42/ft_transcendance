
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity('comment_likes')
@Unique(['user', 'comment'])
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.commentLikes, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Comment, (comment) => comment.likes, {
    onDelete: 'CASCADE',
  })
  comment!: Comment;

  @CreateDateColumn()
  createdAt!: Date;
}
