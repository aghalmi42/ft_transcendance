import React, { createContext, useContext, useState } from 'react';
import type { PongConfig, GameMatchHistory, Achievement, Tournament, TournamentPlayer, PongTheme } from '../types';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { api } from '../services/api';

export const PONG_THEMES: PongTheme[] = [
  {
    id: 'cyber-neon',
    name: 'Cyber Neon (Par Défaut)',
    bg: '#090d16',
    paddleColor: '#8b5cf6',
    ballColor: '#38bdf8',
    lineColor: '#1e293b',
    glowColor: 'rgba(56, 189, 248, 0.6)',
  },
  {
    id: 'retro-arcade',
    name: 'Retro Arcade Vert',
    bg: '#051b11',
    paddleColor: '#10b981',
    ballColor: '#34d399',
    lineColor: '#064e3b',
    glowColor: 'rgba(52, 211, 153, 0.7)',
  },
  {
    id: 'synthwave-sunset',
    name: 'Synthwave Sunset',
    bg: '#180728',
    paddleColor: '#ec4899',
    ballColor: '#f59e0b',
    lineColor: '#4c1d95',
    glowColor: 'rgba(236, 72, 153, 0.7)',
  },
  {
    id: 'midnight-glitch',
    name: 'Midnight Glitch',
    bg: '#020617',
    paddleColor: '#06b6d4',
    ballColor: '#e0e7ff',
    lineColor: '#0f172a',
    glowColor: 'rgba(6, 182, 212, 0.7)',
  },
];

interface GameContextType {
  config: PongConfig;
  updateConfig: (newConfig: Partial<PongConfig>) => void;
  themes: PongTheme[];
  activeTheme: PongTheme;
  history: GameMatchHistory[];
  achievements: Achievement[];
  recordMatch: (match: Omit<GameMatchHistory, 'id' | 'date'>) => void;
  activeTournament: Tournament | null;
  createTournament: (name: string, size: 4 | 8, players: string[]) => void;
  advanceTournamentMatch: (matchId: string, score1: number, score2: number) => void;
  resetTournament: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useNotification();

  const [config, setConfig] = useState<PongConfig>({
    maxScore: 5,
    ballSpeed: 6,
    paddleSize: 'NORMAL',
    powerUps: true,
    theme: 'cyber-neon',
    mode: 'VS_AI',
    aiDifficulty: 'MEDIUM',
  });

  const [history, setHistory] = useState<GameMatchHistory[]>(api.getMatchHistorySync());

  const [achievements] = useState<Achievement[]>([
    {
      id: 'ach-1',
      title: 'Premier Pas',
      description: 'Terminer votre toute première partie de Pong.',
      icon: '🏓',
      unlocked: true,
      unlockedAt: '15 Août',
    },
    {
      id: 'ach-2',
      title: 'Tueur d\'IA',
      description: 'Vaincre l\'intelligence artificielle en mode Difficile.',
      icon: '🤖',
      unlocked: true,
      unlockedAt: '18 Août',
    },
    {
      id: 'ach-3',
      title: 'Roi du Morpion',
      description: 'Gagner 3 parties consécutives de Morpion.',
      icon: '❌',
      unlocked: false,
    },
    {
      id: 'ach-4',
      title: 'Génie du Quiz',
      description: 'Obtenir un score parfait dans le Quiz Battle.',
      icon: '🧠',
      unlocked: false,
    },
    {
      id: 'ach-5',
      title: 'Champion du Tournoi',
      description: 'Remporter la finale d\'un tournoi à 8 joueurs.',
      icon: '🏆',
      unlocked: false,
    },
  ]);

  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);

  const activeTheme = PONG_THEMES.find((t) => t.id === config.theme) || PONG_THEMES[0];

  const updateConfig = (newConfig: Partial<PongConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const recordMatch = (matchData: Omit<GameMatchHistory, 'id' | 'date'>) => {
    const newMatch: GameMatchHistory = {
      ...matchData,
      id: 'match-' + Date.now(),
      date: 'À l\'instant',
    };

    setHistory((prev) => [newMatch, ...prev]);

    // Update user stats & XP
    if (user) {
      const isWin = matchData.result === 'VICTORY';
      const gainedXp = isWin ? 150 : 50;
      const newXp = (user.xp || 0) + gainedXp;
      const newLevel = Math.floor(newXp / 500) + 1;
      const newWins = isWin ? (user.wins || 0) + 1 : user.wins || 0;
      const newLosses = !isWin && matchData.result === 'DEFEAT' ? (user.losses || 0) + 1 : user.losses || 0;

      updateProfile({
        xp: newXp,
        level: newLevel,
        wins: newWins,
        losses: newLosses,
      });

      addToast(
        `Partie terminée ! +${gainedXp} XP gagnés`,
        isWin ? 'success' : 'info',
        isWin ? '🏆 VICTOIRE' : 'DÉFAITE'
      );
    }
  };

  const createTournament = (name: string, size: 4 | 8, playerNames: string[]) => {
    const players: TournamentPlayer[] = playerNames.map((pname, idx) => ({
      id: 't-player-' + idx,
      username: pname,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${pname}`,
      isAI: pname.toLowerCase().includes('bot') || pname.toLowerCase().includes('ai'),
      seed: idx + 1,
    }));

    const matches = [];
    const firstRoundMatchesCount = size / 2;

    for (let i = 0; i < firstRoundMatchesCount; i++) {
      matches.push({
        id: `match-r1-m${i + 1}`,
        round: 1,
        matchNumber: i + 1,
        player1: players[i * 2],
        player2: players[i * 2 + 1],
        score1: 0,
        score2: 0,
        winner: null,
        isCompleted: false,
      });
    }

    // Semi finals
    const semiCount = size === 8 ? 2 : 1;
    for (let i = 0; i < semiCount; i++) {
      matches.push({
        id: `match-r2-m${i + 1}`,
        round: 2,
        matchNumber: i + 1,
        player1: null,
        player2: null,
        score1: 0,
        score2: 0,
        winner: null,
        isCompleted: false,
      });
    }

    // Final if 8 players
    if (size === 8) {
      matches.push({
        id: 'match-r3-m1',
        round: 3,
        matchNumber: 1,
        player1: null,
        player2: null,
        score1: 0,
        score2: 0,
        winner: null,
        isCompleted: false,
      });
    }

    const newTournament: Tournament = {
      id: 'tourn-' + Date.now(),
      name,
      size,
      status: 'IN_PROGRESS',
      players,
      matches,
      champion: null,
      createdAt: new Date().toISOString(),
    };

    setActiveTournament(newTournament);
    addToast(`Tournoi "${name}" (${size} Joueurs) créé avec succès !`, 'success');
  };

  const advanceTournamentMatch = (matchId: string, score1: number, score2: number) => {
    if (!activeTournament) return;

    const matches = [...activeTournament.matches];
    const matchIdx = matches.findIndex((m) => m.id === matchId);
    if (matchIdx === -1) return;

    const match = { ...matches[matchIdx] };
    match.score1 = score1;
    match.score2 = score2;
    match.winner = score1 > score2 ? match.player1 : match.player2;
    match.isCompleted = true;
    matches[matchIdx] = match;

    let champion = activeTournament.champion;

    // Check next round propagation
    if (activeTournament.size === 4) {
      if (match.round === 1) {
        const finalMatch = matches.find((m) => m.round === 2);
        if (finalMatch) {
          if (match.matchNumber === 1) finalMatch.player1 = match.winner;
          if (match.matchNumber === 2) finalMatch.player2 = match.winner;
        }
      } else if (match.round === 2) {
        champion = match.winner;
      }
    } else if (activeTournament.size === 8) {
      if (match.round === 1) {
        const semi1 = matches.find((m) => m.round === 2 && m.matchNumber === 1);
        const semi2 = matches.find((m) => m.round === 2 && m.matchNumber === 2);
        if (match.matchNumber === 1 && semi1) semi1.player1 = match.winner;
        if (match.matchNumber === 2 && semi1) semi1.player2 = match.winner;
        if (match.matchNumber === 3 && semi2) semi2.player1 = match.winner;
        if (match.matchNumber === 4 && semi2) semi2.player2 = match.winner;
      } else if (match.round === 2) {
        const finalMatch = matches.find((m) => m.round === 3);
        if (finalMatch) {
          if (match.matchNumber === 1) finalMatch.player1 = match.winner;
          if (match.matchNumber === 2) finalMatch.player2 = match.winner;
        }
      } else if (match.round === 3) {
        champion = match.winner;
      }
    }

    const isCompleted = champion !== null;

    setActiveTournament({
      ...activeTournament,
      matches,
      champion,
      status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
    });

    if (champion) {
      addToast(`🎉 Le tournoi est terminé ! Victoire de ${champion.username} !`, 'success', 'GRAND CHAMPION');
    }
  };

  const resetTournament = () => {
    setActiveTournament(null);
  };

  return (
    <GameContext.Provider
      value={{
        config,
        updateConfig,
        themes: PONG_THEMES,
        activeTheme,
        history,
        achievements,
        recordMatch,
        activeTournament,
        createTournament,
        advanceTournamentMatch,
        resetTournament,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

const defaultGameFallback: GameContextType = {
  config: {
    maxScore: 5,
    ballSpeed: 6,
    paddleSize: 'NORMAL',
    powerUps: false,
    theme: 'classic',
    mode: 'LOCAL_PVP',
    aiDifficulty: 'MEDIUM',
    scoreToWin: 5,
    powerUpsEnabled: false,
  },


  updateConfig: () => {},
  themes: PONG_THEMES,
  activeTheme: PONG_THEMES[0],
  history: [],
  achievements: [],
  recordMatch: () => {},
  activeTournament: null,
  createTournament: () => {},
  advanceTournamentMatch: () => {},
  resetTournament: () => {},
};

export const useGame = () => {
  const context = useContext(GameContext);
  return context || defaultGameFallback;
};
