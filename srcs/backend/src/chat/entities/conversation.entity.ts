
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Unique(['userA', 'userB'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.conversationsAsA, {
    onDelete: 'CASCADE',
  })
  userA!: User;

  @ManyToOne(() => User, (user) => user.conversationsAsB, {
    onDelete: 'CASCADE',
  })
  userB!: User;

  @OneToMany(() => Message, (message) => message.conversation)
  messages!: Message[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}