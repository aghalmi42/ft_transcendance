import React, { useState } from 'react';
import { MOCK_GAMES_CATALOG as GAMES_CATALOG, type GameInfo } from '../../services/mockData';

export type { GameInfo };
export { GAMES_CATALOG };

type CategoryFilter = 'ALL' | 'PLAYABLE' | 'RETRO' | 'ACTION' | 'PUZZLE' | 'RACING';

interface GameCatalogProps {
  onSelectGame: (gameId: string) => void;
  searchQuery?: string;
}

export const GameCatalog: React.FC<GameCatalogProps> = ({ onSelectGame, searchQuery = '' }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');

  const filteredGames = GAMES_CATALOG.filter((game) => {
    const matchesCategory =
      activeCategory === 'ALL'
        ? true
        : activeCategory === 'PLAYABLE'
        ? game.isPlayable
        : game.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full py-4 space-y-6 animate-fadeIn text-left font-sans">
      {}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-7 bg-slate-900 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ARCADE RETRO & ESPORT HUB</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Catalogue & Hub des Jeux Légendaires
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Explorez notre salle d'arcade réunissant **Pong RPG 2D**, **BrickTris** et **Tron Lightcycles**, le tout optimisé en 60 FPS avec classements ELO et cosmétiques !
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectGame('pong')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-violet-600/30 cursor-pointer flex items-center gap-2"
            >
              <span>🏓</span>
              <span>Lancer Pong RPG 2D</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {[
          { key: 'ALL', label: `✨ Tous les Titres (${GAMES_CATALOG.length})` },
          { key: 'ACTION', label: '🏓 Pong RPG' },
          { key: 'PUZZLE', label: '🧱 BrickTris' },
          { key: 'RACING', label: '🏍️ Tron Grid' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key as CategoryFilter)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeCategory === tab.key
                ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/30'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 font-mono tracking-wider uppercase flex items-center gap-2">
            <span>🕹️</span> Salle d'Arcade Active ({filteredGames.length} Titres 60 FPS)
          </h3>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            ✓ Tous les jeux sont prêts et jouables
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className={`flex flex-col justify-between overflow-hidden rounded-2xl p-4 transition-all duration-200 border ${
                game.isPlayable
                  ? 'bg-slate-900/90 border-violet-500/60 hover:border-violet-400 shadow-xl ring-1 ring-violet-500/30'
                  : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                {}
                <div
                  className={`w-full aspect-[16/9] rounded-xl bg-gradient-to-br ${game.bannerGradient} relative overflow-hidden flex flex-col justify-between p-3 border border-slate-800 shadow-inner`}
                >
                  {}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                      {game.releaseYear}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        game.isPlayable
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                          : 'bg-violet-950/80 text-violet-300 border-violet-500/40'
                      }`}
                    >
                      {game.statusText}
                    </span>
                  </div>

                  {}
                  <div className="relative z-10 flex items-center justify-center my-auto">
                    <span className="text-5xl filter drop-shadow-lg transform transition-transform hover:scale-110">
                      {game.icon}
                    </span>
                  </div>

                  {}
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800">
                    <span className="font-bold">{game.players}</span>
                    <span className="text-slate-400">{game.genre}</span>
                  </div>
                </div>

                {}
                <div>
                  <h4 className="text-sm font-black text-white">
                    {game.title}
                  </h4>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {game.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {}
              <div className="pt-3 mt-3 border-t border-slate-800">
                {game.isPlayable ? (
                  <button
                    onClick={() => onSelectGame(game.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30"
                  >
                    <span>{game.icon}</span>
                    <span>Lancer la Partie</span>
                  </button>
                ) : (
                  <div className="py-2.5 px-3 rounded-xl bg-slate-950/90 text-center text-xs font-mono font-bold text-violet-400 border border-violet-900/40 flex items-center justify-center gap-1.5">
                    <span>⏳</span>
                    <span>Venant Prochainement</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameCatalog;
