import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (code: string) => void;
  onVerify?: (code: string) => Promise<boolean>;
  title?: string;
  qrCodeUrl?: string;
  secret?: string;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onVerify,
  title = '🔐 Vérification Double Facteur (2FA)',
  qrCodeUrl,
  secret,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres valide');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      if (onVerify) {
        const success = await onVerify(code.trim());
        if (success) {
          onSuccess(code.trim());
          onClose();
        } else {
          setError('Code 2FA invalide ou expiré.');
        }
      } else {

        onSuccess(code.trim());
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la validation du code.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {qrCodeUrl && (
          <div className="flex flex-col items-center p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <img src={qrCodeUrl} alt="2FA QR Code" className="w-44 h-44 rounded-xl border border-slate-700 shadow-md" />
            {secret && (
              <p className="text-[10px] font-mono text-slate-400">
                Clé manuelle : <span className="text-violet-400 font-bold">{secret}</span>
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-slate-300 leading-relaxed">
          {"Veuillez saisir le code à 6 chiffres généré par votre application d'authentification (Google Authenticator, Authy, etc.)."}
        </p>

        <Input
          label="Code de sécurité (6 chiffres)"
          type="text"
          maxLength={6}
          placeholder="ex: 123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          error={error}
          autoFocus
          className="text-center font-mono tracking-widest text-lg font-bold"
        />

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isVerifying}>
            Valider le code
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TwoFactorModal;
