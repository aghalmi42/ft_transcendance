import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface GameInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderName: string;
  gameType: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const GameInviteModal: React.FC<GameInviteModalProps> = ({
  isOpen,
  onClose,
  senderName,
  gameType,
  onAccept,
  onDecline,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🏓 Défi de Match Reçu !"
      maxWidth="sm"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-violet-600/20 border border-violet-500/40 mx-auto flex items-center justify-center text-3xl animate-bounce">
          🏓
        </div>

        <div>
          <h4 className="text-base font-black text-slate-100">
            {senderName} vous défie !
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Partie en direct de <strong className="text-cyan-400">{gameType}</strong>.
            Êtes-vous prêt à relever le défi ?
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              onDecline();
              onClose();
            }}
          >
            Refuser
          </Button>
          <Button
            variant="neon"
            size="md"
            onClick={() => {
              onAccept();
              onClose();
            }}
            leftIcon={<span>🔥</span>}
          >
            Accepter le Duel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
