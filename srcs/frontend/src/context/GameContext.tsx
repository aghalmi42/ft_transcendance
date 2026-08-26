import React, { createContext, useContext, useEffect, useState } from 'react';
import type { PongConfig, GameMatchHistory, PongTheme } from '../types';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { api } from '../services/api';

import { DEFAULT_PONG_THEMES as PONG_THEMES } from '../services/mockData';
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

  // Local matches (e.g. client-simulated Pong) are recorded live via recordMatch();
  // this pulls the server-persisted history (currently real for TicTacToe) so it
  // survives reloads and shows up across devices/sessions.
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

      // Pong isn't backend-integrated yet, so these fields are (correctly) rejected
      // server-side — this stays a local-only stat preview until that lands.
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
