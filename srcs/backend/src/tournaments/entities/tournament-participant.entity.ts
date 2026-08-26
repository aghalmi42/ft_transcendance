import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tournament } from './tournament.entity';

@Entity('tournament_participants')
@Unique(['tournament', 'user'])
export class TournamentParticipant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tournament, (t) => t.participants, { onDelete: 'CASCADE' })
  tournament!: Tournament;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'int' })
  seed!: number;

  @Column({ type: 'boolean', default: false })
  eliminated!: boolean;

  @CreateDateColumn()
  joinedAt!: Date;
}
