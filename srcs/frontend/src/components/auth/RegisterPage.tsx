import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';

interface RegisterPageProps {
  onNavigate: (tabId: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { addToast } = useNotification();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!username || username.trim().length < 3) {
      errs.username = "Le nom d'utilisateur doit comporter au moins 3 caractères";
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Veuillez saisir une adresse email valide";
    }
    if (!password || password.length < 6) {
      errs.password = "Le mot de passe doit comporter au moins 6 caractères";
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    if (!agreed) {
      errs.agreed = "Vous devez accepter les conditions d'utilisation";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
      addToast("Compte créé avec succès ! Bienvenue.", "success");
      onNavigate('home');
    } catch (err: any) {
      addToast(err?.message || "Erreur lors de la création du compte", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-8">
      <div className="w-full max-w-md space-y-6">
        {}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 items-center justify-center shadow-md mb-2">
            <span className="text-2xl">📝</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Créer un compte Joueur
          </h2>
          <p className="text-xs text-slate-400">
            Inscription rapide pour jouer à Pong, Tic-Tac-Toe et Snake
          </p>
        </div>

        {}
        <Card className="bg-slate-900 border border-slate-800 shadow-xl p-6">
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <Input
              label="Nom d'utilisateur"
              type="text"
              placeholder="ex: pong_master"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              required
            />

            <Input
              label="Adresse Email"
              type="email"
              placeholder="ex: player@42paris.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              required
            />

            <div className="flex items-center gap-2 pt-1 text-left">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="text-xs text-slate-400 cursor-pointer">
                J'accepte les conditions d'utilisation
              </label>
            </div>
            {errors.agreed && (
              <p className="text-[11px] text-rose-400 text-left">{errors.agreed}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={loading}
            >
              S'inscrire
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Déjà un compte ? Se connecter
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
