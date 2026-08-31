import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { useNotification } from '../../context/NotificationContext';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Table, type Column } from '../common/Table';
import type { GameMatchHistory } from '../../types';

interface ProfileViewProps {
  onNavigate: (tabId: string) => void;
}

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const { history } = useGame();
  const { addToast } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [customAvatar, setCustomAvatar] = useState(user?.avatar || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    setCustomAvatar(user?.avatar || '');
  }, [user?.avatar]);

  const AVATAR_PRESETS = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=CyberBot`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=NeonKnight`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=PixelWarrior`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=ShadowGamer`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Super42`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=RetroArcade`,
  ];

  if (!user) return null;

  const totalMatches = (user.wins || 0) + (user.losses || 0);
  const winRate = totalMatches > 0 ? (((user.wins || 0) / totalMatches) * 100).toFixed(1) : '0';

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        bio,
        avatar: customAvatar || undefined,
      });
      setIsEditing(false);
      addToast('Profil mis à jour avec succès !', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Impossible de mettre à jour le profil.', 'error');
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      addToast('Format non supporté (jpeg, png, webp ou gif requis).', 'error');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      addToast('Image trop lourde (2 Mo maximum).', 'error');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      addToast('Photo de profil mise à jour !', 'success');
    } catch (err: any) {
      addToast(err?.message || "Échec de l'envoi de l'image.", 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const matchColumns: Column<GameMatchHistory>[] = [
    {
      header: 'Jeu',
      render: (m) => (
        <span className="font-semibold text-slate-200">
          {m.gameType === 'PONG' ? '🏓 Pong' : m.gameType === 'TICTACTOE' ? '⭕ Morpion' : '🐍 Snake'}
        </span>
      ),
    },
    {
      header: 'Adversaire',
      render: (m) => (
        <div className="flex items-center gap-2">
          <Avatar username={m.opponentName} src={m.opponentAvatar} size="xs" />
          <span className="text-xs">{m.opponentName}</span>
        </div>
      ),
    },
    {
      header: 'Score',
      align: 'center',
      render: (m) => (
        <span className="font-mono font-bold text-xs">
          {m.userScore} - {m.opponentScore}
        </span>
      ),
    },
    {
      header: 'Résultat',
      align: 'center',
      render: (m) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            m.result === 'VICTORY'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : m.result === 'DEFEAT'
              ? 'bg-rose-950 text-rose-300 border border-rose-800'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          {m.result === 'VICTORY' ? 'Victoire' : m.result === 'DEFEAT' ? 'Défaite' : 'Égalité'}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'date',
      align: 'right',
    },
  ];

  return (
    <div className="space-y-6 w-full text-left font-sans">
      {}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <div className="shrink-0 space-y-2">
              <div className="relative group">
                <Avatar username={user.username} src={user.avatar} size="xl" status={user.status} />
                {isEditing && (
                  <button
                    onClick={() => setCustomAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=seed_${Math.random().toString(36).substring(2, 7)}`)}
                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Générer aléatoirement"
                  >
                    🎲 Nouveau
                  </button>
                )}
              </div>
              {isEditing && (
                <label className="block text-center text-[10px] font-mono text-violet-400 hover:text-violet-300 cursor-pointer underline">
                  {isUploadingAvatar ? 'Envoi en cours...' : '📷 Importer une photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                    disabled={isUploadingAvatar}
                  />
                </label>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white">{user.username}</h1>
              <p className="text-xs text-slate-400">{user.email}</p>

              {isEditing ? (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                      Choisir un avatar prédéfini :
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_PRESETS.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="Avatar preset"
                          onClick={() => setCustomAvatar(url)}
                          className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-all ${
                            customAvatar === url ? 'border-violet-400 scale-110' : 'border-slate-800 hover:border-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                      Ou URL personnalisée :
                    </label>
                    <input
                      type="url"
                      value={customAvatar}
                      onChange={(e) => setCustomAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                      Biographie :
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Votre biographie..."
                      className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-300 italic pt-1 max-w-lg">
                  "{user.bio || 'Aucune biographie rédigée.'}"
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveProfile}>
                  Enregistrer
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                  Modifier le profil
                </Button>
                <Button variant="primary" size="sm" onClick={() => onNavigate('game')}>
                  Jouer
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center p-4 bg-slate-900 border-slate-800">
          <span className="text-2xl font-bold text-white block">
            {totalMatches}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Matchs Joués
          </span>
        </Card>

        <Card className="text-center p-4 bg-slate-900 border-slate-800">
          <span className="text-2xl font-bold text-emerald-400 block">
            {user.wins || 0}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Victoires
          </span>
        </Card>

        <Card className="text-center p-4 bg-slate-900 border-slate-800">
          <span className="text-2xl font-bold text-rose-400 block">
            {user.losses || 0}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Défaites
          </span>
        </Card>

        <Card className="text-center p-4 bg-slate-900 border-slate-800">
          <span className="text-2xl font-bold text-white block">
            {winRate}%
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Taux de Victoire
          </span>
        </Card>
      </div>

      {}
      <Card title="Historique des Matchs" subtitle="Détail de vos confrontations 1v1 et tournois">
        <Table
          columns={matchColumns}
          data={history}
          keyExtractor={(m) => m.id}
          emptyMessage="Aucun match enregistré pour le moment."
        />
      </Card>
    </div>
  );
};

export default ProfileView;
