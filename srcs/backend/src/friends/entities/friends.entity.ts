import { FriendshipStatus } from '../../common/enums/friendship-status.enum';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('friendships')
@Unique(['sender', 'receiver']) 
export class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // L'utilisateur qui initie la demande
  @ManyToOne(() => User, (user) => user.sentFriendships, {
    onDelete: 'CASCADE',
  })
  sender!: User;

  // L'utilisateur qui reçoit la demande
  @ManyToOne(() => User, (user) => user.receivedFriendships, {
    onDelete: 'CASCADE',
  })
  receiver!: User;

  @Column({
    type: 'enum',
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING,
  })
  status!: FriendshipStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}