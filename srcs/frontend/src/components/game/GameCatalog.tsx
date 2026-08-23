import React, { useState } from 'react';

export interface GameInfo {
  id: string;
  title: string;
  genre: string;
  category: 'ACTION' | 'PUZZLE' | 'RETRO';
  icon: string;
  players: string;
  description: string;
  isPlayable: boolean;
}

export const GAMES_CATALOG: GameInfo[] = [
  {
    id: 'pong',
    title: 'Pong 2D',
    genre: 'Jeu de Raquettes 1v1',
    category: 'ACTION',
    icon: '🏓',
    players: '1v1 Local • Bots IA • Tournois',
    description: 'Le jeu historique de Pong en Canvas 2D avec contrôles fluides et mode tournoi.',
    isPlayable: true,
  },
  {
    id: 'tictactoe',
    title: 'Tic-Tac-Toe (Morpion)',
    genre: 'Stratégie Rapide',
    category: 'PUZZLE',
    icon: '⭕',
    players: 'Vs IA • 1v1 Local',
    description: 'Alignez 3 symboles sur une grille Canvas 2D face à un adversaire ou un ami.',
    isPlayable: true,
  },
];

type CategoryFilter = 'ALL' | 'ACTION' | 'PUZZLE' | 'RETRO';

interface GameCatalogProps {
  onSelectGame: (gameId: string) => void;
  searchQuery?: string;
}

export const GameCatalog: React.FC<GameCatalogProps> = ({ onSelectGame, searchQuery = '' }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');

  const filteredGames = GAMES_CATALOG.filter((game) => {
    const matchesCategory = activeCategory === 'ALL' || game.category === activeCategory;
    const matchesSearch = !searchQuery.trim() || 
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full py-2 space-y-6 text-left font-sans">
      {/* Header Banner */}
      <div className="rounded-xl p-6 bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">
            Jeux Disponibles
          </h2>
          <p className="text-sm text-slate-400">
            Sélectionnez un jeu pour lancer une partie locale, contre l'ordinateur ou en tournoi.
          </p>
        </div>

        <button
          onClick={() => onSelectGame('pong')}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start md:self-auto"
        >
          Lancer Pong 1v1
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { key: 'ALL', label: 'Tous les Jeux' },
          { key: 'ACTION', label: 'Pong' },
          { key: 'PUZZLE', label: 'Tic-Tac-Toe' },
          { key: 'RETRO', label: 'Snake' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key as CategoryFilter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              activeCategory === tab.key
                ? 'bg-slate-800 border-slate-700 text-white font-semibold'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Games */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="flex flex-col justify-between rounded-xl p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl">
                  {game.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {game.title}
                  </h3>
                  <span className="text-xs text-slate-400 font-normal">
                    {game.genre}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {game.description}
              </p>

              <div className="pt-2 text-[11px] text-slate-500">
                Mode : <span className="text-slate-300">{game.players}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80">
              <button
                onClick={() => onSelectGame(game.id)}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Jouer maintenant
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameCatalog;
