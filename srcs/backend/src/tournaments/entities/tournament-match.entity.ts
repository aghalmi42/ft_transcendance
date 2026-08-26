import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tournament } from './tournament.entity';

@Entity('tournament_matches')
export class TournamentMatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tournament, (t) => t.matches, { onDelete: 'CASCADE' })
  tournament!: Tournament;

  @Column({ type: 'int' })
  round!: number;

  @Column({ type: 'int' })
  matchNumber!: number;

  @Column({ type: 'uuid', nullable: true })
  player1Id!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'player1Id' })
  player1!: User | null;

  @Column({ type: 'uuid', nullable: true })
  player2Id!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'player2Id' })
  player2!: User | null;

  @Column({ type: 'int', default: 0 })
  score1!: number;

  @Column({ type: 'int', default: 0 })
  score2!: number;

  @Column({ type: 'uuid', nullable: true })
  winnerId!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'winnerId' })
  winner!: User | null;

  @Column({ type: 'boolean', default: false })
  isCompleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
