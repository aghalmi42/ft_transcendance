import React, { useState } from 'react';
import { soundEffects } from '../../services/audio';
import type { HeroRole, ChampionSkin } from '../pong/types';
import type { TeamSize, MatchStats, KeybindConfig } from './types';
import { loadSavedKeybinds } from './configs';
import { ShooTacToeArena } from './views/ShooTacToeArena';
import { KeybindsModal } from './views/KeybindsModal';
import { ChampionSelectView } from '../pong/views/ChampionSelectView';

interface ShooTacToeProps {
  onNavigate?: (tabId: string) => void;
}

export const ShooTacToeGame: React.FC<ShooTacToeProps> = ({ onNavigate }) => {
  const [gameState, setGameState] = useState<'SELECT' | 'PLAYING' | 'GAMEOVER'>('SELECT');
  const [playerRole, setPlayerRole] = useState<HeroRole>('SHOOTER');
  const [selectedSkin, setSelectedSkin] = useState<ChampionSkin | undefined>(undefined);
  const [teamSize, setTeamSize] = useState<TeamSize>(1);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [keybinds, setKeybinds] = useState<KeybindConfig>(loadSavedKeybinds());
  const [isKeybindsOpen, setIsKeybindsOpen] = useState<boolean>(false);

  const currentDim = 3 + teamSize;

  const handleStartMatch = () => {
    setGameState('PLAYING');
    soundEffects.playPowerUp();
  };

  const handleMatchEnd = (stats: MatchStats) => {
    setMatchStats(stats);
    setGameState('GAMEOVER');
  };

  const formatKeyName = (k: string) => {
    if (k === ' ') return 'ESPACE';
    if (k === 'ArrowUp') return '↑';
    if (k === 'ArrowDown') return '↓';
    if (k === 'ArrowLeft') return '←';
    if (k === 'ArrowRight') return '→';
    return k.toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 my-4 text-left font-sans animate-fade-in pb-16">
      {}
      <KeybindsModal
        isOpen={isKeybindsOpen}
        onClose={() => setIsKeybindsOpen(false)}
        currentKeybinds={keybinds}
        onSaveKeybinds={(newCfg) => setKeybinds(newCfg)}
      />

      {}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <span>🚀 ARENA SPACE DOMINION • SHOOTACTOE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>ShooTacToe</span>
            <span className="text-xs px-2.5 py-1 bg-cyan-950 text-cyan-400 border border-cyan-500/40 rounded-full font-mono">
              Modes 1v1 à 4v4 • Grille Tactique ({currentDim}x{currentDim})
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Contrôles : <span className="text-cyan-300 font-mono font-bold">{formatKeyName(keybinds.moveUp)}{formatKeyName(keybinds.moveLeft)}{formatKeyName(keybinds.moveDown)}{formatKeyName(keybinds.moveRight)}</span> ({keybinds.preset}) • Sorts : <span className="text-cyan-300 font-mono font-bold">{formatKeyName(keybinds.spell1)}, {formatKeyName(keybinds.spell2)}, {formatKeyName(keybinds.spell3)}, {formatKeyName(keybinds.spell4)}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {gameState === 'PLAYING' && (
            <button
              onClick={() => setGameState('SELECT')}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-cyan-300 font-mono font-bold text-xs uppercase rounded-xl border border-cyan-500/40 cursor-pointer shadow-md transition-all"
            >
              🔄 Changer de Champion
            </button>
          )}

          <button
            onClick={() => {
              setIsKeybindsOpen(true);
              soundEffects.playClick();
            }}
            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-cyan-400 font-mono font-bold text-xs uppercase rounded-xl border border-cyan-500/40 hover:border-cyan-400 flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <span>⚙️ Préférences Touches</span>
            <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
              {keybinds.preset}
            </span>
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('games')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase rounded-xl border border-slate-700 cursor-pointer"
            >
              ← Catalogue de Jeux
            </button>
          )}
        </div>
      </div>

      {}
      {gameState === 'SELECT' && (
        <div className="space-y-6">
          {}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase">
              Format de Combat Spatial :
            </span>
            <div className="flex flex-wrap gap-2">
              {([1, 2, 3, 4] as TeamSize[]).map((size) => {
                const isSelected = teamSize === size;
                const gridD = 3 + size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setTeamSize(size);
                      soundEffects.playClick();
                    }}
                    className={`px-4 py-2 rounded-xl font-mono text-xs font-black transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-white'
                    }`}
                  >
                    {size}v{size} (Grille {gridD}x{gridD})
                  </button>
                );
              })}
            </div>
          </div>

          <ChampionSelectView
            matchSize="1v1"
            selectedRole={playerRole}
            selectedSkin={selectedSkin}
            onSelectRole={(role) => setPlayerRole(role)}
            onSelectSkin={(skin) => setSelectedSkin(skin)}
            onBack={() => onNavigate && onNavigate('games')}
            onNext={handleStartMatch}
          />
        </div>
      )}

      {}
      {gameState === 'PLAYING' && (
        <ShooTacToeArena
          playerRole={playerRole}
          teamSize={teamSize}
          keybinds={keybinds}
          onOpenKeybinds={() => setIsKeybindsOpen(true)}
          onMatchEnd={handleMatchEnd}
        />
      )}

      {}
      {gameState === 'GAMEOVER' && matchStats && (
        <div className="bg-slate-950/90 border border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl text-center space-y-6 animate-fade-in max-w-2xl mx-auto">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-900 border border-slate-700 flex items-center justify-center text-4xl shadow-xl">
            {matchStats.winner === 'BLUE' ? '🏆' : '💀'}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-cyan-400 uppercase">
              RÉSULTAT DU MATCH {matchStats.teamSize}v{matchStats.teamSize} (GRILLE {matchStats.gridDim}x{matchStats.gridDim})
            </span>
            <h2 className="text-3xl font-black text-white">
              {matchStats.winner === 'BLUE' ? 'VICTOIRE DE L\'ÉQUIPE BLEUE !' : 'VICTOIRE DE L\'ÉQUIPE ROUGE !'}
            </h2>
            <p className="text-xs text-slate-400">
              {matchStats.winner === 'BLUE'
                ? `Votre escouade a verrouillé un alignement complet de ${matchStats.gridDim} cases dans la grille ${matchStats.gridDim}x${matchStats.gridDim} !`
                : 'L\'équipe adverse a dominé le secteur et complété son alignement spatial.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-left font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">DURÉE</span>
              <span className="text-white font-bold">{matchStats.durationSeconds}s</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">KILLS TOTAUX</span>
              <span className="text-cyan-400 font-bold">{matchStats.blueKills} (Bleu) / {matchStats.redKills} (Rouge)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ZONES VERROUILLÉES</span>
              <span className="text-emerald-400 font-bold">{matchStats.blueCellsHeld} (Bleu) / {matchStats.redCellsHeld} (Rouge)</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setGameState('SELECT')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase rounded-xl shadow-lg cursor-pointer"
            >
              🔄 Rejouer une Partie
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate('games')}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase rounded-xl cursor-pointer"
              >
                Catalogue de Jeux
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShooTacToeGame;
