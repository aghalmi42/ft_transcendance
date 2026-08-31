import React, { createContext, useContext, useEffect, useState } from 'react';
import type { PongConfig, GameMatchHistory, PongTheme } from '../types';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { api } from '../services/api';

const PONG_THEMES: PongTheme[] = [
  { id: 'cyber-neon', name: 'Cyber Neon', bg: '#090d16', paddleColor: '#8b5cf6', ballColor: '#38bdf8', lineColor: '#1e293b', glowColor: 'rgba(56, 189, 248, 0.6)' },
  { id: 'retro-arcade', name: 'Retro Arcade Vert', bg: '#051b11', paddleColor: '#10b981', ballColor: '#34d399', lineColor: '#064e3b', glowColor: 'rgba(52, 211, 153, 0.7)' },
  { id: 'synthwave-sunset', name: 'Synthwave Sunset', bg: '#180728', paddleColor: '#ec4899', ballColor: '#f59e0b', lineColor: '#4c1d95', glowColor: 'rgba(236, 72, 153, 0.7)' },
];
export { PONG_THEMES };

interface GameContextType {
  config: PongConfig;
  updateConfig: (newConfig: Partial<PongConfig>) => void;
  themes: PongTheme[];
  activeTheme: PongTheme;
  history: GameMatchHistory[];
  recordMatch: (match: Omit<GameMatchHistory, 'id' | 'date'>) => void;
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

  useEffect(() => {
    if (!user) return;
    api.getMatchHistory().then((remote) => {
      if (!Array.isArray(remote) || remote.length === 0) return;
      setHistory((prev) => {
        const knownIds = new Set(prev.map((m) => m.id));
        const newOnes = remote.filter((m) => !knownIds.has(m.id));
        return [...newOnes, ...prev];
      });
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
      }).catch(() => {});

      addToast(
        `Partie terminée ! +${gainedXp} XP gagnés`,
        isWin ? 'success' : 'info',
        isWin ? '🏆 VICTOIRE' : 'DÉFAITE'
      );
    }
  };

  return (
    <GameContext.Provider
      value={{
        config,
        updateConfig,
        themes: PONG_THEMES,
        activeTheme,
        history,
        recordMatch,
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
    powerUps: true,
    theme: 'neon',
    mode: 'LOCAL_PVP',
    aiDifficulty: 'MEDIUM',
    scoreToWin: 5,
    powerUpsEnabled: true,
  },
  updateConfig: () => {},
  themes: PONG_THEMES,
  activeTheme: PONG_THEMES[0],
  history: [],
  recordMatch: () => {},
};

export const useGame = () => {
  const context = useContext(GameContext);
  return context || defaultGameFallback;
};
