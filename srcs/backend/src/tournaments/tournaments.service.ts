import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Tournament } from './entities/tournament.entity';
import { TournamentParticipant } from './entities/tournament-participant.entity';
import { TournamentMatch } from './entities/tournament-match.entity';
import { TournamentStatus } from './enums/tournament-status.enum';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { ReportMatchResultDto } from './dto/report-match-result.dto';

import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/enums/notification-type.enum';

@Injectable()
export class TournamentsService {
  private readonly logger = new Logger(TournamentsService.name);

  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentsRepository: Repository<Tournament>,
    @InjectRepository(TournamentParticipant)
    private readonly participantsRepository: Repository<TournamentParticipant>,
    @InjectRepository(TournamentMatch)
    private readonly matchesRepository: Repository<TournamentMatch>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(user: User, dto: CreateTournamentDto) {
    const tournament = this.tournamentsRepository.create({ name: dto.name, size: dto.size, creator: user });
    const saved = await this.tournamentsRepository.save(tournament);

    const participant = this.participantsRepository.create({ tournament: saved, user, seed: 1 });
    await this.participantsRepository.save(participant);

    return this.findOneWithDetails(saved.id);
  }

  findAll() {
    return this.tournamentsRepository.find({ relations: ['creator', 'champion'], order: { createdAt: 'DESC' } });
  }

  async findOneWithDetails(id: string) {
    const tournament = await this.tournamentsRepository.findOne({ where: { id }, relations: ['creator', 'champion'] });
    if (!tournament) throw new NotFoundException('Tournoi introuvable.');

    const participants = await this.participantsRepository.find({
      where: { tournament: { id } },
      relations: ['user'],
      order: { seed: 'ASC' },
    });
    const matches = await this.matchesRepository.find({
      where: { tournament: { id } },
      relations: ['player1', 'player2', 'winner'],
      order: { round: 'ASC', matchNumber: 'ASC' },
    });

    return Object.assign(tournament, { participants, matches });
  }

  async register(user: User, tournamentId: string) {
    const tournament = await this.tournamentsRepository.findOneBy({ id: tournamentId });
    if (!tournament) throw new NotFoundException('Tournoi introuvable.');
    if (tournament.status !== TournamentStatus.REGISTRATION) {
      throw new BadRequestException('Les inscriptions sont closes pour ce tournoi.');
    }

    const existing = await this.participantsRepository.findOne({
      where: { tournament: { id: tournamentId }, user: { id: user.id } },
    });
    if (existing) throw new BadRequestException('Vous êtes déjà inscrit à ce tournoi.');

    const count = await this.participantsRepository.count({ where: { tournament: { id: tournamentId } } });
    if (count >= tournament.size) throw new BadRequestException('Le tournoi est déjà complet.');

    const participant = this.participantsRepository.create({ tournament, user, seed: count + 1 });
    await this.participantsRepository.save(participant);

    if (count + 1 === tournament.size) {
      await this.generateBracket(tournament);
    }

    return this.findOneWithDetails(tournamentId);
  }

  async unregister(user: User, tournamentId: string) {
    const tournament = await this.tournamentsRepository.findOneBy({ id: tournamentId });
    if (!tournament) throw new NotFoundException('Tournoi introuvable.');
    if (tournament.status !== TournamentStatus.REGISTRATION) {
      throw new BadRequestException('Impossible de se désinscrire, le tournoi a déjà commencé.');
    }

    const participant = await this.participantsRepository.findOne({
      where: { tournament: { id: tournamentId }, user: { id: user.id } },
    });
    if (!participant) throw new NotFoundException("Vous n'êtes pas inscrit à ce tournoi.");

    await this.participantsRepository.remove(participant);
    return { success: true };
  }

  async reportResult(user: User, tournamentId: string, matchId: string, dto: ReportMatchResultDto) {
    const tournament = await this.tournamentsRepository.findOne({ where: { id: tournamentId }, relations: ['creator'] });
    if (!tournament) throw new NotFoundException('Tournoi introuvable.');

    const match = await this.matchesRepository.findOne({
      where: { id: matchId, tournament: { id: tournamentId } },
      relations: ['player1', 'player2'],
    });
    if (!match) throw new NotFoundException('Match introuvable.');
    if (match.isCompleted) throw new BadRequestException('Ce match est déjà terminé.');
    if (!match.player1Id || !match.player2Id) {
      throw new BadRequestException("Les deux joueurs ne sont pas encore connus pour ce match.");
    }

    const isParticipant = user.id === match.player1Id || user.id === match.player2Id;
    const isOrganizer = user.id === tournament.creator.id || user.role === UserRole.ADMIN;
    if (!isParticipant && !isOrganizer) {
      throw new ForbiddenException('Vous ne pouvez pas rapporter le résultat de ce match.');
    }
    if (dto.winnerId !== match.player1Id && dto.winnerId !== match.player2Id) {
      throw new BadRequestException("Le vainqueur doit être l'un des deux joueurs du match.");
    }

    match.score1 = dto.score1;
    match.score2 = dto.score2;
    match.winnerId = dto.winnerId;
    match.isCompleted = true;
    const saved = await this.matchesRepository.save(match);

    const loser = saved.winnerId === saved.player1Id ? saved.player2! : saved.player1!;
    await this.participantsRepository.update(
      { tournament: { id: tournamentId }, user: { id: loser.id } },
      { eliminated: true },
    );
    this.notificationsService
      .create({ recipient: loser, actor: null, type: NotificationType.TOURNAMENT_ELIMINATED, entityId: tournamentId })
      .catch((err) => this.logger.error('Notification failed', err));

    await this.tryAdvanceRound(tournament, saved);

    return this.findOneWithDetails(tournamentId);
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private async generateBracket(tournament: Tournament): Promise<void> {
    const participants = await this.participantsRepository.find({
      where: { tournament: { id: tournament.id } },
      relations: ['user'],
    });

    const shuffled = this.shuffle(participants);
    shuffled.forEach((p, idx) => { p.seed = idx + 1; });
    await this.participantsRepository.save(shuffled);

    const round1: TournamentMatch[] = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      round1.push(
        this.matchesRepository.create({
          tournament,
          round: 1,
          matchNumber: i / 2 + 1,
          player1: shuffled[i].user,
          player1Id: shuffled[i].user.id,
          player2: shuffled[i + 1].user,
          player2Id: shuffled[i + 1].user.id,
        }),
      );
    }
    const saved = await this.matchesRepository.save(round1);

    tournament.status = TournamentStatus.IN_PROGRESS;
    await this.tournamentsRepository.save(tournament);

    for (const match of saved) {
      this.notifyMatchReady(match);
    }
  }

  private async tryAdvanceRound(tournament: Tournament, completedMatch: TournamentMatch): Promise<void> {
    const roundMatches = await this.matchesRepository.find({
      where: { tournament: { id: tournament.id }, round: completedMatch.round },
      relations: ['player1', 'player2'],
      order: { matchNumber: 'ASC' },
    });

    if (!roundMatches.every((m) => m.isCompleted)) return;

    if (roundMatches.length === 1) {
      const champion = completedMatch.winnerId === completedMatch.player1Id ? completedMatch.player1! : completedMatch.player2!;
      tournament.status = TournamentStatus.COMPLETED;
      tournament.championId = champion.id;
      await this.tournamentsRepository.save(tournament);
      this.notificationsService
        .create({ recipient: champion, actor: null, type: NotificationType.TOURNAMENT_WON, entityId: tournament.id })
        .catch((err) => this.logger.error('Notification failed', err));
      return;
    }

    const winnerOf = (m: TournamentMatch): User => (m.winnerId === m.player1Id ? m.player1! : m.player2!);
    const nextRound = completedMatch.round + 1;
    const nextMatches: TournamentMatch[] = [];
    for (let i = 0; i < roundMatches.length; i += 2) {
      const w1 = winnerOf(roundMatches[i]);
      const w2 = winnerOf(roundMatches[i + 1]);
      nextMatches.push(
        this.matchesRepository.create({
          tournament,
          round: nextRound,
          matchNumber: i / 2 + 1,
          player1: w1,
          player1Id: w1.id,
          player2: w2,
          player2Id: w2.id,
        }),
      );
    }
    const saved = await this.matchesRepository.save(nextMatches);
    for (const match of saved) {
      this.notifyMatchReady(match);
    }
  }

  private notifyMatchReady(match: TournamentMatch): void {
    for (const recipient of [match.player1, match.player2]) {
      if (!recipient) continue;
      this.notificationsService
        .create({ recipient, actor: null, type: NotificationType.TOURNAMENT_MATCH_READY, entityId: match.id })
        .catch((err) => this.logger.error('Notification failed', err));
    }
  }
}
