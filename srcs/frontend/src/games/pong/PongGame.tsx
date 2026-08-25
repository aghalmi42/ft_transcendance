import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../services/audio';
import type { MatchSize, HeroRole, MapTheme, SelectionStep, ControlMode, ChampionSkin, GameOverData } from './types';
import { BreadcrumbStepper } from './views/BreadcrumbStepper';
import { ModeSelectView } from './views/ModeSelectView';
import { ControlsSelectView } from './views/ControlsSelectView';
import { ChampionSelectView } from './views/ChampionSelectView';
import { MapSelectView } from './views/MapSelectView';
import { PongArenaView } from './views/PongArenaView';
import { PostMatchRecapView } from './views/PostMatchRecapView';
import { OnlinePongDuelArena } from './views/OnlinePongDuelArena';

interface PongGameProps {
  initialMatchSize?: MatchSize;
  initialDuelRoomId?: string;
  initialOpponentName?: string;
  onNavigate?: (tabId: string) => void;
}

export const PongGame: React.FC<PongGameProps> = ({
  initialMatchSize,
  initialDuelRoomId,
  initialOpponentName,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { recordMatch } = useGame();

  const [step, setStep] = useState<SelectionStep>(initialDuelRoomId ? 'IN_GAME' : 'MODE_SELECT');
  const [matchSize, setMatchSize] = useState<MatchSize>(initialMatchSize || (initialDuelRoomId ? 'ONLINE_1v1' : '4v4'));
  const [controlMode, setControlMode] = useState<ControlMode>('KEYBOARD_MOUSE');
  const [selectedRole, setSelectedRole] = useState<HeroRole>('SHOOTER');
  const [selectedSkin, setSelectedSkin] = useState<ChampionSkin | undefined>(undefined);
  const [selectedMap, setSelectedMap] = useState<MapTheme>(initialMatchSize === 'PACMAN_GOAL' ? 'PACMAN_MAZE' : 'CYBER');
  const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);

  const handleGoToControls = () => {
    setStep('CONTROLS_SELECT');
    try {
      soundEffects.playClick();
    } catch {}
  };

  const handleGoToChampSelect = () => {
    setStep('CHAMP_SELECT');
    try {
      soundEffects.playClick();
    } catch {}
  };

  const handleGoToMapSelect = () => {
    setStep('MAP_SELECT');
    try {
      soundEffects.playClick();
    } catch {}
  };

  const handleStartGame = () => {
    setStep('IN_GAME');
    try {
      soundEffects.playPowerUp();
    } catch {}
  };

  const handleFinishMatch = (data: GameOverData) => {
    setGameOverData(data);
    setStep('GAME_OVER');

    if (data.mode !== 'PRACTICE') {
      const isWin = data.winnerTeam === 'BLUE';
      recordMatch({
        opponent: data.mode === '1v1' ? 'Adversaire 1v1' : `Équipe Rouge (${data.mode})`,
        myScore: data.scoreBlue,
        opponentScore: data.scoreRed,
        result: isWin ? 'VICTORY' : 'DEFEAT',
        gameMode: data.mode,
        duration: data.matchDurationFormatted || '02:30',
        xpEarned: isWin ? 150 : 50,
      });
    }
  };

  return (
    <div className="space-y-6 w-full max-w-[1550px] mx-auto text-left font-sans animate-fade-in">
      <BreadcrumbStepper
        step={step}
        onStepClick={(targetStep) => {
          setStep(targetStep);
          try {
            soundEffects.playClick();
          } catch {}
        }}
      />

      {step === 'MODE_SELECT' && (
        <ModeSelectView
          matchSize={matchSize}
          onSelectMode={setMatchSize}
          onNext={handleGoToControls}
        />
      )}

      {step === 'CONTROLS_SELECT' && (
        <ControlsSelectView
          matchSize={matchSize}
          controlMode={controlMode}
          onSelectControlMode={setControlMode}
          onBack={() => {
            try { soundEffects.playClick(); } catch {}
            setStep('MODE_SELECT');
          }}
          onNext={handleGoToChampSelect}
        />
      )}

      {step === 'CHAMP_SELECT' && (
        <ChampionSelectView
          matchSize={matchSize}
          selectedRole={selectedRole}
          selectedSkin={selectedSkin}
          onSelectRole={setSelectedRole}
          onSelectSkin={setSelectedSkin}
          onBack={() => {
            try { soundEffects.playClick(); } catch {}
            setStep('CONTROLS_SELECT');
          }}
          onNext={handleGoToMapSelect}
        />
      )}

      {step === 'MAP_SELECT' && (
        <MapSelectView
          selectedRole={selectedRole}
          selectedMap={selectedMap}
          onSelectMap={setSelectedMap}
          onBack={() => {
            try { soundEffects.playClick(); } catch {}
            setStep('CHAMP_SELECT');
          }}
          onStart={handleStartGame}
        />
      )}

      {step === 'IN_GAME' && (
        matchSize === 'ONLINE_1v1' ? (
          <OnlinePongDuelArena
            roomId={initialDuelRoomId}
            selectedRole={selectedRole}
            selectedMap={selectedMap}
            opponentName={initialOpponentName || 'Adversaire en ligne'}
            onGameOver={handleFinishMatch}
            onQuit={() => {
              try { soundEffects.playClick(); } catch {}
              setStep('MODE_SELECT');
            }}
          />
        ) : (
          <PongArenaView
            matchSize={matchSize}
            selectedRole={selectedRole}
            selectedSkin={selectedSkin}
            selectedMap={selectedMap}
            controlMode={controlMode}
            onGameOver={handleFinishMatch}
            onQuit={() => {
              try { soundEffects.playClick(); } catch {}
              setStep('MODE_SELECT');
            }}
          />
        )
      )}

      {step === 'GAME_OVER' && gameOverData && (
        <PostMatchRecapView
          data={gameOverData}
          onPlayAgain={() => {
            try { soundEffects.playClick(); } catch {}
            setStep('MODE_SELECT');
          }}
          onChangeMap={() => {
            try { soundEffects.playClick(); } catch {}
            setStep('MAP_SELECT');
          }}
          onChangeChampion={() => {
            try { soundEffects.playClick(); } catch {}
            setStep('CHAMP_SELECT');
          }}
        />
      )}
    </div>
  );
};

export default PongGame;
