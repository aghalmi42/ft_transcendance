import React from 'react';
import { PongGame } from '../../games/pong/PongGame';
import { ShooTacToeGame } from '../../games/shootactoe/ShooTacToeGame';
import { SnakeOutTheFlagGame } from '../../games/snakeouttheflag/SnakeOutTheFlagGame';
import { TicTacToeLobby } from '../../games/tictactoe/TicTacToeLobby';

interface GamingHubPageProps {
  onNavigate?: (tabId: string) => void;
  initialGame?: string;
  initialDuelRoomId?: string;
  initialOpponentName?: string;
}

export const GamingHubPage: React.FC<GamingHubPageProps> = ({
  onNavigate,
  initialGame = 'pong',
  initialDuelRoomId,
  initialOpponentName,
}) => {
  return (
    <div className="space-y-6 w-full max-w-[1550px] mx-auto animate-fadeIn text-left relative">
      {(initialGame === 'shootactoe' || initialGame === 'shoo-tac-toe' || initialGame === 'morpion-spatial') ? (
        <ShooTacToeGame onNavigate={onNavigate} />
      ) : (initialGame === 'snakeouttheflag' || initialGame === 'snake-out-the-flag' || initialGame === 'snake-ctf') ? (
        <SnakeOutTheFlagGame onNavigate={onNavigate} />
      ) : (initialGame === 'hungrygoal' || initialGame === 'hungry-goal' || initialGame === 'reverse-hockey') ? (
        <PongGame initialMatchSize="PACMAN_GOAL" />
      ) : (initialGame === 'tictactoe' || initialGame === 'tic-tac-toe') ? (
        <TicTacToeLobby />
      ) : (
        <PongGame
          initialDuelRoomId={initialDuelRoomId}
          initialOpponentName={initialOpponentName}
        />
      )}
    </div>
  );
};

export default GamingHubPage;
