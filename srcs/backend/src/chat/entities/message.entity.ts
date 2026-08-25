
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => User, (user) => user.sentMessages, {
    onDelete: 'CASCADE',
  })
  sender!: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  conversation!: Conversation;

  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}

