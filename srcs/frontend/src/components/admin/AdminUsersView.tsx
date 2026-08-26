import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Table, type Column } from '../common/Table';
import type { User, UserRole } from '../../types';

interface AdminUsersViewProps {
  onNavigate: (tabId: string) => void;
}

const ROLE_OPTIONS: UserRole[] = ['admin', 'moderator', 'user', 'guest'];

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  moderator: 'Modérateur',
  user: 'Utilisateur',
  guest: 'Invité',
};

const ROLE_BADGE_VARIANT: Record<UserRole, 'danger' | 'warning' | 'success' | 'slate'> = {
  admin: 'danger',
  moderator: 'warning',
  user: 'success',
  guest: 'slate',
};

export const AdminUsersView: React.FC<AdminUsersViewProps> = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await api.getAllUsers();
      setUsers(list || []);
    } catch {
      addToast('Impossible de charger la liste des utilisateurs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Card className="p-8 text-center bg-slate-900 border-slate-800">
        <p className="text-sm text-slate-400">Accès réservé aux administrateurs.</p>
      </Card>
    );
  }

  const handleRoleChange = async (target: User, role: UserRole) => {
    setBusyId(target.id);
    try {
      const updated = await api.updateUser(target.id, { role });
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, ...updated } : u)));
      addToast(`Rôle de @${target.username} mis à jour.`, 'success');
    } catch (err: any) {
      addToast(err?.message || 'Échec de la mise à jour du rôle.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (target: User) => {
    if (target.id === currentUser.id) {
      addToast('Vous ne pouvez pas supprimer votre propre compte depuis ce panneau.', 'error');
      return;
    }
    if (!window.confirm(`Supprimer définitivement le compte @${target.username} ? Cette action est irréversible.`)) {
      return;
    }
    setBusyId(target.id);
    try {
      await api.deleteUser(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      addToast(`Compte @${target.username} supprimé.`, 'info');
    } catch (err: any) {
      addToast(err?.message || 'Échec de la suppression.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Utilisateur',
      render: (u) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar username={u.username} src={u.avatar} size="sm" status={u.status} />
          <div className="min-w-0">
            <div className="font-bold text-white truncate">@{u.username}</div>
            <div className="text-[10px] text-slate-500 font-mono truncate">{u.id}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Stats',
      align: 'center',
      render: (u) => (
        <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
          {u.wins || 0}V / {u.losses || 0}D · {u.eloRating || 1000} ELO
        </span>
      ),
    },
    {
      header: 'Rôle',
      align: 'center',
      render: (u) => (
        <div className="flex items-center justify-center gap-2">
          <Badge variant={ROLE_BADGE_VARIANT[u.role || 'user']} size="sm">
            {ROLE_LABELS[u.role || 'user']}
          </Badge>
          <select
            value={u.role || 'user'}
            disabled={busyId === u.id || u.id === currentUser.id}
            onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
            className="bg-slate-950 border border-slate-700 rounded-lg text-[11px] text-white px-2 py-1 disabled:opacity-40 cursor-pointer"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <Button
          variant="danger"
          size="sm"
          disabled={busyId === u.id || u.id === currentUser.id}
          onClick={() => handleDelete(u)}
        >
          Supprimer
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full text-left font-sans animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur-md shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <span className="text-2xl">🛡️</span> Administration
          </h2>
          <p className="text-xs text-slate-400">Gestion des comptes, rôles et permissions (CRUD utilisateurs).</p>
        </div>
        <Badge variant="danger" size="sm">{users.length} compte{users.length > 1 ? 's' : ''}</Badge>
      </div>

      <Card title="Utilisateurs" subtitle="Modifiez le rôle d'un membre ou supprimez son compte.">
        <Table
          columns={columns}
          data={users}
          keyExtractor={(u) => u.id}
          emptyMessage={loading ? 'Chargement...' : 'Aucun utilisateur.'}
        />
      </Card>
    </div>
  );
};

export default AdminUsersView;
