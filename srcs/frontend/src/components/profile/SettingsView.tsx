import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { soundEffects } from '../../services/audio';

interface ApiKeyRow {
  id: string;
  label: string;
  revoked: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export const SettingsView: React.FC<{ onNavigate: (tabId: string) => void }> = ({ onNavigate }) => {
  const { addToast } = useNotification();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordBusy, setIsPasswordBusy] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundEffects.isSoundEnabled());

  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([]);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [isKeyBusy, setIsKeyBusy] = useState(false);

  const loadApiKeys = async () => {
    const keys = await api.listApiKeys();
    setApiKeys(keys);
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyLabel.trim()) return addToast('Donnez un nom à cette clé.', 'error');
    setIsKeyBusy(true);
    try {
      const created = await api.createApiKey(newKeyLabel.trim());
      setRevealedKey(created.key);
      setNewKeyLabel('');
      await loadApiKeys();
    } catch (err: any) {
      addToast(err?.message || 'Échec de la création de la clé.', 'error');
    } finally {
      setIsKeyBusy(false);
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    setIsKeyBusy(true);
    try {
      await api.revokeApiKey(id);
      await loadApiKeys();
      addToast('Clé révoquée.', 'info');
    } catch (err: any) {
      addToast(err?.message || 'Échec de la révocation.', 'error');
    } finally {
      setIsKeyBusy(false);
    }
  };

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.setSoundEnabled(next);
    if (next) soundEffects.playClick();
    addToast(`Effets sonores ${next ? 'activés' : 'désactivés'}`, 'info');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) return addToast('Mot de passe actuel requis.', 'error');
    if (!newPassword || newPassword.length < 6) return addToast('Mot de passe : 6 caractères min.', 'error');
    if (newPassword !== confirmPassword) return addToast('Les mots de passe ne correspondent pas', 'error');

    setIsPasswordBusy(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      addToast('Mot de passe mis à jour !', 'success');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      addToast(err?.message || 'Échec de la mise à jour du mot de passe.', 'error');
    } finally {
      setIsPasswordBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full text-left font-sans animate-fadeIn">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <span>⚙️</span> Paramètres & Sécurité
        </h2>
        <p className="text-xs text-slate-400">Gérez vos options de compte et de son.</p>
      </div>

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
          <Input label="Mot de passe actuel" type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          <Input label="Nouveau mot de passe" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <Input label="Confirmer mot de passe" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          <Button type="submit" variant="secondary" size="sm" isLoading={isPasswordBusy}>
            Enregistrer
          </Button>
        </form>
      </Card>

      <Card title="🔑 Clés API (Accès développeur)" subtitle="Utilisez l'en-tête X-API-Key pour appeler /api/v1/posts en dehors de l'application">
        <div className="space-y-4">
          {revealedKey && (
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800 space-y-1.5">
              <p className="text-[11px] text-amber-300 font-bold">
                Copiez cette clé maintenant — elle ne sera plus jamais affichée.
              </p>
              <code className="block text-[11px] text-white bg-slate-950 rounded p-2 break-all select-all">{revealedKey}</code>
              <Button variant="ghost" size="sm" onClick={() => setRevealedKey(null)}>J'ai copié la clé</Button>
            </div>
          )}

          <form onSubmit={handleCreateApiKey} className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Nom de la clé"
                placeholder="ex: mon-script"
                value={newKeyLabel}
                onChange={(e) => setNewKeyLabel(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" size="sm" isLoading={isKeyBusy}>
              Générer
            </Button>
          </form>

          <div className="space-y-2">
            {apiKeys.length === 0 ? (
              <p className="text-[11px] text-slate-500">Aucune clé API pour le moment.</p>
            ) : (
              apiKeys.map((k) => (
                <div key={k.id} className="flex items-center justify-between text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                  <div>
                    <span className="font-bold text-slate-200">{k.label}</span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      créée le {new Date(k.createdAt).toLocaleDateString()}
                      {k.lastUsedAt ? ` · utilisée le ${new Date(k.lastUsedAt).toLocaleDateString()}` : ''}
                    </span>
                  </div>
                  {k.revoked ? (
                    <Badge variant="slate" size="sm">Révoquée</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" isLoading={isKeyBusy} onClick={() => handleRevokeApiKey(k.id)}>
                      Révoquer
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
export default SettingsView;
