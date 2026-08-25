import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { soundEffects } from '../../services/audio';

export const SettingsView: React.FC<{ onNavigate: (tabId: string) => void }> = ({ onNavigate }) => {
  const { user, toggle2FA } = useAuth();
  const { addToast } = useNotification();

  const [, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(soundEffects.isSoundEnabled());
  const [is2FALoading, setIs2FALoading] = useState(false);

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.setSoundEnabled(next);
    if (next) soundEffects.playClick();
    addToast(`Effets sonores ${next ? 'activés' : 'désactivés'}`, 'info');
  };

  const handle2FAToggle = async () => {
    setIs2FALoading(true);
    try {
      const active = await toggle2FA();
      addToast(`2FA ${active ? 'activée' : 'désactivée'}`, active ? 'success' : 'warning');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return addToast('Mot de passe : 6 caractères min.', 'error');
    if (newPassword !== confirmPassword) return addToast('Les mots de passe ne correspondent pas', 'error');
    addToast('Mot de passe mis à jour !', 'success');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full text-left font-sans animate-fadeIn">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <span>⚙️</span> Paramètres & Sécurité
        </h2>
        <p className="text-xs text-slate-400">Gérez vos options de compte, son et sécurité 2FA.</p>
      </div>

      <Card title="🛡️ Double Authentification (2FA)" subtitle="Sécurisez vos connexions avec Google Authenticator">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200">Statut :</span>
            <Badge variant={user?.twoFactorEnabled ? 'success' : 'slate'} size="sm">
              {user?.twoFactorEnabled ? 'Actif' : 'Désactivé'}
            </Badge>
          </div>
          <Button
            variant={user?.twoFactorEnabled ? 'danger' : 'primary'}
            size="sm"
            onClick={handle2FAToggle}
            isLoading={is2FALoading}
          >
            {user?.twoFactorEnabled ? 'Désactiver la 2FA' : 'Activer la 2FA (QR Code)'}
          </Button>
        </div>
      </Card>

      <Card title="🔊 Préférences Audio & Musique" subtitle="Configurez les sons de jeu et le volume">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-200 block">Effets sonores</span>
            <span className="text-[11px] text-slate-400">Bruits de raquettes, sorts et impacts</span>
          </div>
          <Button variant={soundEnabled ? 'primary' : 'ghost'} size="sm" onClick={handleSoundToggle}>
            {soundEnabled ? '🔊 Activé' : '🔇 Muet'}
          </Button>
        </div>
      </Card>

      <Card title="⌨️ Configuration des Touches" subtitle="Personnalisez vos raccourcis de sorts et déplacements">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Clavier AZERTY / QWERTY et touches personnalisées</p>
          <Button variant="neon" size="sm" onClick={() => onNavigate('keybinds')}>
            Modifier les Touches ⌨️
          </Button>
        </div>
      </Card>

      <Card title="🔒 Modifier le Mot de Passe" subtitle="Mettez à jour vos identifiants de connexion">
        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <Input label="Nouveau mot de passe" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <Input label="Confirmer mot de passe" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          <Button type="submit" variant="secondary" size="sm">
            Enregistrer
          </Button>
        </form>
      </Card>
    </div>
  );
};
export default SettingsView;
