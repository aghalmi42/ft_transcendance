import type { TicTacToeState } from './types';
import { api } from '../../services/api';
import { APP_CONFIG } from '../../config/appConfig';

const API_BASE = APP_CONFIG.API_BASE_URL;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = api.getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || `Erreur ${res.status}`);
  }

  return res.json();
}

export function createGame(opponentId: string): Promise<{ gameId: string }> {
  return request('/games', {
    method: 'POST',
    body: JSON.stringify({ opponentId }),
  });
}

export function joinGame(gameId: string): Promise<TicTacToeState> {
  return request(`/games/${gameId}/join`, { method: 'POST' });
}

export function makeMove(gameId: string, position: number): Promise<TicTacToeState> {
  return request(`/games/${gameId}/move`, {
    method: 'POST',
    body: JSON.stringify({ position }),
  });
}

export function getGame(gameId: string): Promise<TicTacToeState> {
  return request(`/games/${gameId}`);
}