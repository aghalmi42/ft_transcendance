import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GameResultType } from '../enums/game-result.enum';
import { User } from '../../users/entities/user.entity';

@Entity('game_results')
export class GameResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  playerXId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playerXId' })
  playerX!: User;

  @Column({ type: 'uuid' })
  playerOId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playerOId' })
  playerO!: User;

  @Column({ type: 'uuid', nullable: true })
  winnerId!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'winnerId' })
  winner!: User | null;

  @Column({
    type: 'enum',
    enum: GameResultType,
  })
  result!: GameResultType;

  @CreateDateColumn()
  createdAt!: Date;
}