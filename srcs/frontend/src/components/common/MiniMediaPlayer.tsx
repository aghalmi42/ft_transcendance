import React, { useState, useEffect } from 'react';
import { soundEffects, TRACKS, type TrackInfo } from '../../services/audio';

export const MiniMediaPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(soundEffects.isMusicPlaying());
  const [currentTrack, setCurrentTrack] = useState<TrackInfo>(soundEffects.getCurrentTrack());
  const [volume, setVolume] = useState<number>(soundEffects.getMusicVolume());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(soundEffects.isCrossfading());
  const tracks = TRACKS;

  useEffect(() => {

    setIsPlaying(soundEffects.isMusicPlaying());
    setCurrentTrack(soundEffects.getCurrentTrack());
    setVolume(soundEffects.getMusicVolume());

    const unsubscribe = soundEffects.onTransitionChange((status) => {
      setIsTransitioning(status);
    });
    return () => unsubscribe();
  }, []);

  const handleTogglePlay = () => {
    const newState = soundEffects.toggleMusic();
    setIsPlaying(newState);
    setCurrentTrack(soundEffects.getCurrentTrack());
  };

  const handleNext = () => {
    const next = soundEffects.nextTrack();
    setCurrentTrack(next);
    setIsPlaying(soundEffects.isMusicPlaying());
  };

  const handleSelectTrack = (index: number) => {
    const track = soundEffects.selectTrack(index);
    setCurrentTrack(track);
    if (!isPlaying) {
      const newState = soundEffects.toggleMusic();
      setIsPlaying(newState);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEffects.setMusicVolume(val);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none font-sans text-left">
      {}
      {isExpanded && (
        <div className="mb-3 w-80 sm:w-96 bg-slate-900/95 border border-slate-700/80 rounded-3xl p-4 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-3.5">
          {}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎧</span>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Gestionnaire de Playtracks
              </h4>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>

          {}
          <div className="p-3 bg-gradient-to-r from-violet-950/80 to-slate-950 rounded-2xl border border-violet-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-lg flex-shrink-0 ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
              >
                💿
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-violet-300 font-mono font-bold block">
                  EN COURS DE LECTURE
                </span>
                <span className="text-xs font-bold text-white truncate block">
                  {currentTrack.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{currentTrack.bpm} BPM</span>
              </div>
            </div>

            {}
            {isPlaying && (
              <div className="flex items-end gap-1 h-5 flex-shrink-0">
                <span className="w-1 bg-violet-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-5" style={{ animationDelay: '150ms' }} />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" style={{ animationDelay: '300ms' }} />
                <span className="w-1 bg-pink-400 rounded-full animate-bounce h-4" style={{ animationDelay: '75ms' }} />
              </div>
            )}
          </div>

          {}
          <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-1">
              Liste des pistes ({tracks.length})
            </span>

            {tracks.map((track, idx) => {
              const isCurrent = currentTrack.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => handleSelectTrack(idx)}
                  className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/30'
                      : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs">{isCurrent && isPlaying ? '▶️' : '🎵'}</span>
                    <div className="min-w-0 text-left">
                      <span className="truncate block font-medium">{track.title}</span>
                      <span className={`text-[10px] font-mono ${isCurrent ? 'text-violet-200' : 'text-slate-500'}`}>
                        {track.bpm} BPM
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                    #{track.id}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {}
      <div className="flex items-center gap-2.5 p-2 px-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl hover:border-slate-700 transition-all">
        {}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-sm transition-transform hover:scale-105 cursor-pointer ${
            isPlaying ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: '6s' }}
          title="Ouvrir la gestion des pistes"
        >
          💿
        </button>

        {}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer max-w-[120px] sm:max-w-[160px] text-left min-w-0"
          title="Cliquez pour ouvrir la playlist"
        >
          <span className="text-xs font-bold text-slate-200 truncate block">
            {currentTrack.title}
          </span>
          <span className="text-[10px] text-violet-400 font-mono block truncate">
            {isTransitioning ? '✨ Fondu sonore...' : isPlaying ? '▶ En lecture' : '⏸ En pause'}
          </span>
        </div>

        {}
        <button
          onClick={handleTogglePlay}
          className="p-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/30 cursor-pointer"
          title={isPlaying ? 'Mettre en pause' : 'Lancer la musique'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {}
        <button
          onClick={handleNext}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
          title="Piste suivante"
        >
          ⏭
        </button>

        {}
        <div className="hidden sm:flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
          <span className="text-[11px] text-slate-400">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-14 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
            title={`Volume : ${Math.round(volume * 100)}%`}
          />
        </div>

        {}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
          title="Gérer les playtracks"
        >
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>
    </div>
  );
};

export default MiniMediaPlayer;
