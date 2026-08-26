import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TournamentStatus } from '../enums/tournament-status.enum';
import { TournamentParticipant } from './tournament-participant.entity';
import { TournamentMatch } from './tournament-match.entity';

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'int' })
  size!: number;

  @Column({ type: 'enum', enum: TournamentStatus, default: TournamentStatus.REGISTRATION })
  status!: TournamentStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  creator!: User;

  @Column({ type: 'uuid', nullable: true })
  championId!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'championId' })
  champion!: User | null;

  @OneToMany(() => TournamentParticipant, (p) => p.tournament)
  participants!: TournamentParticipant[];

  @OneToMany(() => TournamentMatch, (m) => m.tournament)
  matches!: TournamentMatch[];

  @CreateDateColumn()
  createdAt!: Date;
}
