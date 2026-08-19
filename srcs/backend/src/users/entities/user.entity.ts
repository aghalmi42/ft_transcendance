import { UserStatus } from '../../common/enums/user-status.enum';
import {Friendship} from '../../friends/entities/friends.entity'
import { Post } from '../../posts/entities/post.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

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


  @OneToMany(() => Friendship, (friendship) => friendship.sender)
  sentFriendships!: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.receiver)
  receivedFriendships!: Friendship[];

  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}