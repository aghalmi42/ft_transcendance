import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';

interface GdprCenterProps {
  onNavigate: (tabId: string) => void;
}

export const GdprCenter: React.FC<GdprCenterProps> = ({ onNavigate }) => {
  const { user, exportData, deleteAccount } = useAuth();
  const { addToast } = useNotification();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExport = () => {
    exportData();
    addToast("Fichier d'exportation RGPD (JSON) téléchargé avec succès !", 'success');
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== 'SUPPRIMER') {
      addToast('Veuillez saisir exactement le mot "SUPPRIMER" pour confirmer', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount();
      addToast("Votre compte et l'intégralité de vos données ont été définitivement supprimés.", 'info');
      setIsDeleteModalOpen(false);
      onNavigate('home');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center text-slate-400">
        {"Veuillez vous connecter pour accéder à votre espace de gestion des données personnelles RGPD."}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full text-left">
      {}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <span>🔒</span> {"Centre de Données RGPD & Droit à l'Oubli"}
            </h2>
            <Badge variant="success" size="sm">
              {"Conforme UE 2016/679"}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {"Gérez, exportez et supprimez vos informations personnelles en totale transparence."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onNavigate('privacy')}>
            {"Politique RGPD"}
          </Button>
          <Button variant="neon" size="sm" onClick={handleExport} leftIcon={<span>📥</span>}>
            {"Exporter mes données (JSON)"}
          </Button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {}
        <Card title="1. Droit d'Accès et de Portabilité (Art. 15 & 20 RGPD)" glowColor="purple">
          <div className="space-y-3 text-xs text-slate-300">
            <p>
              {"Vous pouvez récupérer l'ensemble de vos données dans un format JSON ouvert et structuré :"}
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>{"Profil utilisateur & paramètres de sécurité (2FA)"}</li>
              <li>{"Historique complet des matchs et statistiques de jeu"}</li>
              <li>{"Liste des amis, requêtes et statuts de blocage"}</li>
            </ul>
            <Button variant="secondary" size="sm" onClick={handleExport} className="w-full mt-2">
              {"Télécharger mon Archive JSON"}
            </Button>
          </div>
        </Card>

        {}
        <Card title="2. Droit à l'Effacement / Droit à l'Oubli (Art. 17 RGPD)" glowColor="purple">
          <div className="space-y-3 text-xs text-slate-300">
            <p>
              {"Vous pouvez demander la suppression définitive et irréversible de votre compte :"}
            </p>
            <p className="text-rose-400/90 text-[11px]">
              {"⚠️ Cette action supprimera votre profil, vos scores, vos messages et vos succès de manière définitive."}
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full mt-2"
            >
              {"Supprimer Définitivement mon Compte"}
            </Button>
          </div>
        </Card>
      </div>

      {}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="⚠️ Confirmation de Suppression Définitive"
        maxWidth="md"
      >
        <form onSubmit={handleDelete} className="space-y-4 text-left">
          <p className="text-xs text-slate-300 leading-relaxed">
            {"Cette action est irréversible. Pour confirmer la suppression complète de votre compte "}
            <strong className="text-white">@{user.username}</strong>
            {", veuillez taper "}
            <code className="text-rose-400 font-mono font-bold bg-slate-950 px-1 py-0.5 rounded">SUPPRIMER</code>
            {" ci-dessous :"}
          </p>

          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Tapez SUPPRIMER pour confirmer"
            required
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              {"Annuler"}
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              disabled={confirmText !== 'SUPPRIMER'}
            >
              {"Confirmer la Suppression Définitive"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GdprCenter;
