
import { UserStatus } from '../../common/enums/user-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import {Friendship} from '../../friends/entities/friends.entity'
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Exclude } from 'class-transformer';
import { PostLike } from '../../likes/entities/post-like.entity';
import { CommentLike } from '../../likes/entities/comment-like.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Conversation } from '../../chat/entities/conversation.entity';
import { Message } from '../../chat/entities/message.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';

@Entity('users')
@Unique(['oauthProvider', 'oauthId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Exclude()
  @Column({ unique: true })
  email!: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  passwordHash!: string | null;

  @Column({ nullable: true })
  avatar!: string;

  @Column({ type: 'text', nullable: true })
  bio!: string;


  @Column({
  type: 'enum',
  enum: UserStatus,
  default: UserStatus.OFFLINE,
  })
  status!: UserStatus;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ type: 'int', default: 0 })
  wins!: number;

  @Column({ type: 'int', default: 0 })
  losses!: number;

  @Column({ type: 'int', default: 0 })
  draws!: number;

  @Column({ type: 'int', default: 1 })
  level!: number;

  @Column({ type: 'int', default: 0 })
  xp!: number;

  @Column({ type: 'int', default: 1000 })
  eloRating!: number;

  @Column({ type: 'varchar', nullable: true })
  oauthProvider!: string | null;

  @Column({ type: 'varchar', nullable: true })
  oauthId!: string | null;


  @OneToMany(() => Friendship, (friendship) => friendship.sender)
  sentFriendships!: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.receiver)
  receivedFriendships!: Friendship[];

  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments!: Comment[];

  @OneToMany(() => PostLike, (like) => like.user)
  postLikes!: PostLike[];

  @OneToMany(() => CommentLike, (like) => like.user)
  commentLikes!: CommentLike[];
  
  @OneToMany(() => Notification, (notification) => notification.recipient)
  notifications!: Notification[];

  @OneToMany(() => Conversation, (conversation) => conversation.userA)
  conversationsAsA!: Conversation[];

  @OneToMany(() => Conversation, (conversation) => conversation.userB)
  conversationsAsB!: Conversation[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages!: Message[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}