import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import type { Tournament, TournamentMatch } from '../../types';

interface TournamentViewProps {
  onNavigate: (tabId: string) => void;
}

const STATUS_LABELS: Record<Tournament['status'], string> = {
  REGISTRATION: 'Inscriptions ouvertes',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
};

export const TournamentView: React.FC<TournamentViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [tournName, setTournName] = useState('Tournoi Officiel 42');
  const [size, setSize] = useState<4 | 8>(4);

  const loadList = async () => {
    setLoading(true);
    try {
      const list = await api.getTournaments();
      setTournaments(list);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    try {
      const t = await api.getTournament(id);
      setSelected(t);
    } catch (err: any) {
      addToast(err?.message || 'Tournoi introuvable.', 'error');
      setSelected(null);
    }
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await api.createTournament(tournName.trim() || 'Tournoi', size);
      addToast('Tournoi créé ! Inscrivez des joueurs pour lancer le bracket.', 'success');
      setTournaments((prev) => [created, ...prev]);
      setSelected(created);
    } catch (err: any) {
      addToast(err?.message || 'Impossible de créer le tournoi.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (id: string) => {
    setBusy(true);
    try {
      const updated = await api.registerForTournament(id);
      setSelected(updated);
      addToast(
        updated.status === 'IN_PROGRESS'
          ? 'Tournoi complet — le bracket vient de démarrer !'
          : 'Inscription confirmée.',
        'success',
      );
    } catch (err: any) {
      addToast(err?.message || "Échec de l'inscription.", 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleUnregister = async (id: string) => {
    setBusy(true);
    try {
      await api.unregisterFromTournament(id);
      await loadDetail(id);
      addToast('Désinscription confirmée.', 'info');
    } catch (err: any) {
      addToast(err?.message || 'Échec de la désinscription.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleReportResult = async (tournamentId: string, match: TournamentMatch, winnerId: string, score1: number, score2: number) => {
    setBusy(true);
    try {
      const updated = await api.reportTournamentMatchResult(tournamentId, match.id, winnerId, score1, score2);
      setSelected(updated);
      addToast(
        updated.status === 'COMPLETED' ? `🏆 ${updated.champion?.username} remporte le tournoi !` : 'Résultat enregistré.',
        'success',
      );
    } catch (err: any) {
      addToast(err?.message || "Échec de l'enregistrement du résultat.", 'error');
    } finally {
      setBusy(false);
    }
  };

  const isRegistered = (t: Tournament) => !!user && t.players.some((p) => p.id === user.id);
  const rounds = selected ? Array.from(new Set(selected.matches.map((m) => m.round))).sort((a, b) => a - b) : [];

  return (
    <div className="space-y-6 w-full text-left font-sans animate-fadeIn">
      <div className="rounded-xl p-5 bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Tournois</h1>
          <p className="text-xs text-slate-400">Inscrivez-vous, le bracket se génère automatiquement une fois complet</p>
        </div>
        {selected && (
          <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
            ← Retour à la liste
          </Button>
        )}
      </div>

      {!selected ? (
        <div className="space-y-6">
          <Card className="max-w-2xl mx-auto p-6 bg-slate-900 border-slate-800 space-y-4">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Nom du Tournoi</label>
                <input
                  type="text"
                  value={tournName}
                  onChange={(e) => setTournName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2.5"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Nombre de Joueurs</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSize(4)}
                    className={`p-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      size === 4 ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    4 Participants
                  </button>
                  <button
                    type="button"
                    onClick={() => setSize(8)}
                    className={`p-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      size === 8 ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    8 Participants
                  </button>
                </div>
              </div>
              <Button variant="primary" size="md" type="submit" isLoading={busy} className="w-full">
                Créer le Tournoi
              </Button>
            </form>
          </Card>

          <div className="space-y-3">
            {loading ? (
              <p className="text-xs text-slate-500 text-center py-6">Chargement...</p>
            ) : tournaments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Aucun tournoi pour le moment. Créez le premier !</p>
            ) : (
              tournaments.map((t) => (
                <Card
                  key={t.id}
                  className="p-4 bg-slate-900 border-slate-800 cursor-pointer hover:border-slate-700"
                  onClick={() => loadDetail(t.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{t.name}</span>
                        <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'IN_PROGRESS' ? 'warning' : 'slate'} size="sm">
                          {STATUS_LABELS[t.status]}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {t.players.length}/{t.size} joueurs
                        {t.champion ? ` · 🏆 ${t.champion.username}` : ''}
                      </p>
                    </div>
                    {isRegistered(t) && <Badge variant="info" size="sm">Inscrit</Badge>}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="p-5 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{selected.name}</h2>
                  <Badge variant={selected.status === 'COMPLETED' ? 'success' : selected.status === 'IN_PROGRESS' ? 'warning' : 'slate'} size="sm">
                    {STATUS_LABELS[selected.status]}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{selected.players.length}/{selected.size} joueurs inscrits</p>
              </div>

              {selected.status === 'REGISTRATION' && (
                isRegistered(selected) ? (
                  <Button variant="ghost" size="sm" isLoading={busy} onClick={() => handleUnregister(selected.id)}>
                    Se désinscrire
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" isLoading={busy} onClick={() => handleRegister(selected.id)}>
                    S'inscrire
                  </Button>
                )
              )}
            </div>

            {selected.players.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
                {selected.players.map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-full pl-1 pr-2.5 py-1">
                    <Avatar username={p.username} src={p.avatar} size="xs" />
                    <span className="text-[11px] text-slate-300">#{p.seed} {p.username}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {selected.champion && (
            <div className="p-6 rounded-xl bg-slate-900 border border-emerald-800 text-center space-y-2">
              <span className="text-4xl block">🏆</span>
              <h3 className="text-lg font-bold text-emerald-300">
                VAINQUEUR DU TOURNOI : {selected.champion.username} !
              </h3>
            </div>
          )}

          {selected.matches.length > 0 && (
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[700px] flex items-stretch justify-between gap-6">
                {rounds.map((round) => (
                  <div key={round} className="flex-1 space-y-3">
                    <div className="text-center font-bold text-xs uppercase text-slate-400 py-1 bg-slate-900 rounded-lg border border-slate-800">
                      {round === rounds[rounds.length - 1] ? 'Finale 🏆' : `Round ${round}`}
                    </div>
                    {selected.matches
                      .filter((m) => m.round === round)
                      .map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          currentUserId={user?.id}
                          canReport={selected.status === 'IN_PROGRESS'}
                          busy={busy}
                          onReport={(winnerId, score1, score2) => handleReportResult(selected.id, match, winnerId, score1, score2)}
                          onPlay={() => onNavigate('game')}
                        />
                      ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface MatchCardProps {
  match: TournamentMatch;
  currentUserId?: string;
  canReport: boolean;
  busy: boolean;
  onReport: (winnerId: string, score1: number, score2: number) => void;
  onPlay: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, currentUserId, canReport, busy, onReport, onPlay }) => {
  const p1 = match.player1;
  const p2 = match.player2;
  const [reporting, setReporting] = useState(false);
  const [score1, setScore1] = useState('0');
  const [score2, setScore2] = useState('0');

  const isReady = !!p1 && !!p2 && !match.isCompleted;
  const isParticipant = !!currentUserId && (p1?.id === currentUserId || p2?.id === currentUserId);

  const submit = (winnerId: string) => {
    onReport(winnerId, Number(score1) || 0, Number(score2) || 0);
    setReporting(false);
  };

  return (
    <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/80">
        <span className="font-mono text-slate-500">Match #{match.matchNumber}</span>
        {match.isCompleted ? (
          <span className="text-[11px] text-emerald-400 font-medium">Terminé</span>
        ) : (
          <span className="text-[11px] text-slate-400">{isReady ? 'Prêt' : 'En attente'}</span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Avatar username={p1?.username || '?'} src={p1?.avatar} size="xs" />
            <span className={`font-medium ${match.winner?.id === p1?.id ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
              {p1?.username || 'En attente...'}
            </span>
          </div>
          <span className="font-mono font-bold text-slate-300">{match.isCompleted ? match.score1 : '-'}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Avatar username={p2?.username || '?'} src={p2?.avatar} size="xs" />
            <span className={`font-medium ${match.winner?.id === p2?.id ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
              {p2?.username || 'En attente...'}
            </span>
          </div>
          <span className="font-mono font-bold text-slate-300">{match.isCompleted ? match.score2 : '-'}</span>
        </div>
      </div>

      {isReady && canReport && isParticipant && !reporting && (
        <Button variant="secondary" size="sm" className="w-full" onClick={() => setReporting(true)}>
          Rapporter le résultat
        </Button>
      )}

      {isReady && canReport && isParticipant && reporting && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} value={score1} onChange={(e) => setScore1(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-1.5 text-center"
            />
            <span className="text-slate-500 text-xs">-</span>
            <input
              type="number" min={0} value={score2} onChange={(e) => setScore2(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-1.5 text-center"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="primary" size="sm" isLoading={busy} onClick={() => submit(p1!.id)}>
              Victoire {p1?.username}
            </Button>
            <Button variant="primary" size="sm" isLoading={busy} onClick={() => submit(p2!.id)}>
              Victoire {p2?.username}
            </Button>
          </div>
        </div>
      )}

      {isReady && (
        <Button variant="ghost" size="sm" className="w-full" onClick={onPlay}>
          Aller jouer
        </Button>
      )}
    </div>
  );
};

export default TournamentView;
