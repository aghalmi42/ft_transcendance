import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GameResultType } from '../enums/game-result.enum';

@Entity('game_results')
export class GameResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  playerXId!: string;

  @Column({ type: 'uuid' })
  playerOId!: string;

  @Column({ type: 'uuid', nullable: true })
  winnerId!: string | null;

  @Column({
    type: 'enum',
    enum: GameResultType,
  })
  result!: GameResultType;
}