import React, { useState } from 'react';
import { soundEffects } from '../../services/audio';
import type { TeamSize, MatchStatsCTF, CTFKeybinds } from './types';
import { loadSavedCTFKeybinds } from './configs';
import { SnakeCTFArena } from './views/SnakeCTFArena';
import { KeybindsModalCTF } from './views/KeybindsModalCTF';

interface SnakeOutTheFlagProps {
  onNavigate?: (tabId: string) => void;
}

export const SnakeOutTheFlagGame: React.FC<SnakeOutTheFlagProps> = ({ onNavigate }) => {
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [teamSize, setTeamSize] = useState<TeamSize>(2);
  const [matchStats, setMatchStats] = useState<MatchStatsCTF | null>(null);
  const [keybinds, setKeybinds] = useState<CTFKeybinds>(loadSavedCTFKeybinds());
  const [isKeybindsOpen, setIsKeybindsOpen] = useState<boolean>(false);

  const handleStartMatch = (chosenSize: TeamSize) => {
    setTeamSize(chosenSize);
    setGameState('PLAYING');
    soundEffects.playPowerUp();
  };

  const handleMatchEnd = (stats: MatchStatsCTF) => {
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
      <KeybindsModalCTF
        isOpen={isKeybindsOpen}
        onClose={() => setIsKeybindsOpen(false)}
        currentKeybinds={keybinds}
        onSaveKeybinds={(newCfg) => setKeybinds(newCfg)}
      />

      {}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <span>🐍 CASTLE WARS CTF • HALO & SNAKE HYBRID</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Snake Out the Flag</span>
            <span className="text-xs px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-500/40 rounded-full font-mono">
              Capture the Flag Tactique
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Infiltrez le château ennemi en serpent, volez leur drapeau et ramenez-le à votre base ! Mangez des orbes pour grandir et barrer les routes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsKeybindsOpen(true);
              soundEffects.playClick();
            }}
            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-emerald-400 font-mono font-bold text-xs uppercase rounded-xl border border-emerald-500/40 hover:border-emerald-400 flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <span>⚙️ Touches</span>
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
      {gameState === 'MENU' && (
        <div className="space-y-8 bg-slate-950/80 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl">
          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <span className="text-2xl block">🚩</span>
              <h3 className="text-sm font-bold text-white uppercase font-mono">1. Volez le Drapeau</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Traversez les ponts et dérobez le drapeau du château ennemi. Rapportez-le à votre base pour marquer (3 points pour gagner).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <span className="text-2xl block">🍏</span>
              <h3 className="text-sm font-bold text-white uppercase font-mono">2. Grandissez & Bloquez</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Consommez les orbes sur les routes pour allonger votre corps de serpent et verrouiller les portes et ponts défensifs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <span className="text-2xl block">💣</span>
              <h3 className="text-sm font-bold text-white uppercase font-mono">3. Bombes & Escorte Allié</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Posez des <strong className="text-amber-400">Bombes Plasma [{formatKeyName(keybinds.bomb || ' ')}]</strong> qui explosent après 2s en zone d'effet (AOE). Vos alliés vous escortent et ne vous blessent jamais !
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-mono font-bold uppercase text-emerald-400">
              Choisissez la Taille de l'Escouade (Castle Wars) :
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {([1, 2, 4] as TeamSize[]).map((size) => {
                const isSelected = teamSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => {
                      setTeamSize(size);
                      soundEffects.playClick();
                    }}
                    className={`p-5 rounded-2xl border text-center font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-xl font-black block text-white">{size}v{size}</span>
                    <span className="text-xs text-amber-400 font-bold">
                      {size === 1 ? 'Duel Tactique 1v1' : size === 2 ? 'Escouade 2v2' : 'Chaos Castle Wars 4v4'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {size * 2} Serpents sur le terrain
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {}
          <div className="flex flex-col items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleStartMatch(teamSize)}
              className="px-10 py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/30 cursor-pointer transform hover:scale-[1.02] transition-all flex items-center gap-3"
            >
              <span>🚀 Déployer en {teamSize}v{teamSize} Castle Wars</span>
            </button>
            <span className="text-xs text-slate-400 font-mono">
              Direction : <strong className="text-emerald-300">{formatKeyName(keybinds.moveUp)}{formatKeyName(keybinds.moveLeft)}{formatKeyName(keybinds.moveDown)}{formatKeyName(keybinds.moveRight)}</strong> • Bombe Plasma : <strong className="text-amber-300">[{formatKeyName(keybinds.bomb || ' ')}]</strong> • Boost : <strong className="text-cyan-300">[{formatKeyName(keybinds.boost)}]</strong>
            </span>
          </div>
        </div>
      )}

      {}
      {gameState === 'PLAYING' && (
        <SnakeCTFArena
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
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-emerald-400 uppercase">
              RÉSULTAT DU MATCH {matchStats.teamSize}v{matchStats.teamSize}
            </span>
            <h2 className="text-3xl font-black text-white">
              {matchStats.winner === 'BLUE' ? 'VICTOIRE DE L\'ÉQUIPE BLEUE !' : 'VICTOIRE DE L\'ÉQUIPE ROUGE !'}
            </h2>
            <p className="text-xs text-slate-400">
              {matchStats.winner === 'BLUE'
                ? `Votre escouade a sécurisé les 3 drapeaux dans la forteresse ennemie !`
                : 'L\'équipe rouge a conquis le secteur et verrouillé vos drapeaux.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-left font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">SCORE FINAL</span>
              <span className="text-white font-bold">{matchStats.blueScore} - {matchStats.redScore}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DURÉE</span>
              <span className="text-emerald-400 font-bold">{matchStats.durationSeconds}s</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">KILLS DE QUEUE</span>
              <span className="text-cyan-400 font-bold">{matchStats.playerKills} éliminations</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setGameState('MENU')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs uppercase rounded-xl shadow-lg cursor-pointer"
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

export default SnakeOutTheFlagGame;
