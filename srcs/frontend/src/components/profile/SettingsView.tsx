import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { soundEffects } from '../../services/audio';

interface SettingsViewProps {
  onNavigate: (tabId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const { user, toggle2FA } = useAuth();
  const { addToast } = useNotification();

  const [currentPassword, setCurrentPassword] = useState('');
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
      addToast(
        `Authentification 2FA ${active ? 'activée' : 'désactivée'} avec succès`,
        active ? 'success' : 'warning'
      );
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('Le nouveau mot de passe doit comporter au moins 6 caractères', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    addToast('Mot de passe mis à jour avec succès !', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full text-left">
      <div>
        <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <span>⚙️</span> Paramètres & Sécurité
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Gérez vos préférences de jeu, votre sécurité 2FA et vos options de compte.
        </p>
      </div>

      {/* 2FA Security Card (42 Minor Module) */}
      <Card
        title="🛡️ Authentification à Deux Facteurs (2FA)"
        subtitle="Sécurisez votre compte lors des connexions"
        glowColor={user?.twoFactorEnabled ? 'purple' : 'none'}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">Statut du 2FA :</span>
              <Badge
                variant={user?.twoFactorEnabled ? 'success' : 'slate'}
                size="sm"
              >
                {user?.twoFactorEnabled ? 'Actif & Protégé' : 'Désactivé'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Lorsque le 2FA est activé, un code de validation à 6 chiffres vous sera demandé à chaque nouvelle connexion via votre application TOTP (Google Authenticator ou FreeOTP).
            </p>
          </div>

          <Button
            variant={user?.twoFactorEnabled ? 'danger' : 'primary'}
            size="sm"
            onClick={handle2FAToggle}
            isLoading={is2FALoading}
          >
            {user?.twoFactorEnabled ? 'Désactiver le 2FA' : 'Activer le 2FA'}
          </Button>
        </div>
      </Card>

      {/* Game & Audio Preferences & Soundboard */}
      <Card title="🔊 Préférences Audio & Studio Rétro" subtitle="Personnalisez, pré-écoutez ou téléchargez les sons et musiques du jeu">
        <div className="space-y-4 py-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Effets sonores (Web Audio API & MP3)</span>
              <span className="text-[11px] text-slate-400">34 effets sonores rétro pour Pong, Capacités Héros, Mini-Jeux et Chat</span>
            </div>
            <Button
              variant={soundEnabled ? 'neon' : 'secondary'}
              size="sm"
              onClick={handleSoundToggle}
            >
              {soundEnabled ? '🔊 Activé' : '🔇 Muet'}
            </Button>
          </div>

          {/* Soundboard Categories */}
          <div className="border-t border-slate-800/80 pt-3 space-y-3">
            <div>
              <span className="text-[11px] font-bold text-slate-300 block mb-1.5">🏓 Pong & Combat de Champions :</span>
              <div className="flex flex-wrap gap-1.5">
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playPaddleHit()}>🏓 Raquette</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playWallHit()}>🧱 Mur</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playScore()}>⭐ But</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playVictory()}>🏆 Victoire</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playDefeat()}>💀 Défaite</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playDash()}>💨 Dash</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playShield()}>🛡️ Bouclier</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playTeleport()}>🌀 Téléport</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playHeal()}>💚 Soin</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playLaser()}>⚡ Laser</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playExplosion()}>💥 Explosion</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playPowerUp()}>🚀 Power-Up</Button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-300 block mb-1.5">🕹️ Mini-Jeux Arcade & Jeux Rétro :</span>
              <div className="flex flex-wrap gap-1.5">
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playBrickBreak()}>🧱 Brique</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playCombo()}>✨ Combo</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playPacmanChomp()}>🟡 Waka</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playPacmanEatGhost()}>👻 Fantôme</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playPacmanDeath()}>☠️ Pac-Mort</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playInvaderShoot()}>🚀 Tir Alien</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playInvaderKilled()}>👾 Alien Mort</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playSnakeEat()}>🍎 Pomme</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playSnakeDie()}>🐍 Serpent Mort</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playLightcycleCrash()}>🏍️ Tron Crash</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playCardFlip()}>🃏 Carte</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playQuizCorrect()}>✔️ Quiz Bon</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playQuizWrong()}>❌ Quiz Faux</Button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-300 block mb-1.5">💬 UI, Notifications & Social :</span>
              <div className="flex flex-wrap gap-1.5">
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playClick()}>👆 Clic</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playNotification()}>🔔 Notif</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playMessageSend()}>📤 Envoi Msg</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playMessageReceive()}>📥 Reçu Msg</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playMatchFound()}>⚔️ Match Trouvé</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playLevelUp()}>🌟 Level Up</Button>
                <Button variant="secondary" size="sm" onClick={() => soundEffects.playCountdown()}>⏱️ Décompte</Button>
              </div>
            </div>
          </div>

          {/* Music Jukebox and Export */}
          <div className="border-t border-slate-800/80 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-300 block">Jukebox 8-Bit & Synthwave (5 pistes)</span>
              <span className="text-[10px] text-slate-400">Piste actuelle : <strong className="text-purple-300">{soundEffects.getCurrentTrack().title}</strong> ({soundEffects.getCurrentTrack().bpm} BPM)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const track = soundEffects.nextTrack();
                  addToast(`Piste suivante : ${track.title}`, 'info');
                }}
              >
                ⏭️ Piste Suivante
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const isPlaying = soundEffects.toggleMusic();
                  addToast(isPlaying ? `Lecture : ${soundEffects.getCurrentTrack().title}` : 'Musique arrêtée', 'info');
                }}
              >
                🎵 {soundEffects.isMusicPlaying() ? 'Pause BGM' : 'Lire BGM'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  soundEffects.downloadAllSounds();
                  addToast('Export des 34 sons et 5 musiques lancé !', 'success');
                }}
              >
                📥 Exporter Tous les Sons (.mp3)
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Password Change */}
      <Card title="🔑 Modifier le Mot de passe" subtitle="Mettez à jour vos identifiants d'accès">
        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <Input
            label="Mot de passe actuel"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="Nouveau mot de passe"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirmer le nouveau mot de passe"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button variant="primary" size="sm" type="submit">
            Enregistrer le mot de passe
          </Button>
        </form>
      </Card>

      {/* GDPR Quick Access Link */}
      <Card
        title="🔒 Données Personnelles & Conformité RGPD"
        subtitle="Consultez, exportez ou supprimez vos données"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 max-w-md">
            Conformément aux normes RGPD, vous disposez d'un droit d'accès, d'export complet et d'effacement de vos données.
          </p>
          <Button variant="outline" size="sm" onClick={() => onNavigate('gdpr')}>
            Accéder à l'Espace RGPD
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsView;
