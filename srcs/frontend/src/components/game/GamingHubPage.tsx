import React, { useState } from 'react';
import { PongGame } from '../../games/pong/PongGame';
import { ShooTacToeGame } from '../../games/shootactoe/ShooTacToeGame';
import { SnakeOutTheFlagGame } from '../../games/snakeouttheflag/SnakeOutTheFlagGame';
import { InGameChatOverlay } from '../chat/InGameChatOverlay';
import { PublicUserProfileModal } from '../profile/PublicUserProfileModal';
import type { User } from '../../types';
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
  const [visitedUser, setVisitedUser] = useState<User | null>(null);

  const getGameTitle = () => {
    if (initialGame === 'shootactoe' || initialGame === 'shoo-tac-toe') return 'ShooTacToe Dominion';
    if (initialGame === 'snakeouttheflag' || initialGame === 'snake-ctf') return 'Snake Out the Flag';
    if (initialGame === 'hungrygoal' || initialGame === 'hungry-goal' || initialGame === 'reverse-hockey') return 'Hungry Goal Hockey';
    if (initialGame === 'tictactoe' || initialGame === 'tic-tac-toe') return 'Tic-Tac-Toe'
    return 'Pong RPG 2D';
  };

  return (
    <div className="space-y-6 w-full max-w-[1550px] mx-auto animate-fadeIn text-left relative">
      {}
      <PublicUserProfileModal
        user={visitedUser}
        isOpen={!!visitedUser}
        onClose={() => setVisitedUser(null)}
        onNavigate={onNavigate}
      />

      {}
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

      {}
      <InGameChatOverlay
        gameName={getGameTitle()}
        onOpenUserProfile={(u) => setVisitedUser(u)}
      />
    </div>
  );
};

export default GamingHubPage;
