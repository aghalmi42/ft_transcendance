import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';

interface LoginPageProps {
  onNavigate: (tabId: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { addToast } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "L'adresse email est requise";
    }
    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 4) {
      newErrors.password = "Le mot de passe doit comporter au moins 4 caractères";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await performLogin();
  };

  const performLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      addToast("Connexion réussie ! Bienvenue sur ft_transcendence.", "success");
      onNavigate('home');
    } catch (err: any) {
      addToast(err?.message || "Identifiants invalides", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('transcendence42!');
  };

  return (
    <div className="flex-1 flex items-center justify-center py-8">
      <div className="w-full max-w-md space-y-6">
        {}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 items-center justify-center shadow-md mb-2">
            <span className="text-2xl">🏓</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Connexion à ft_transcendence
          </h2>
          <p className="text-xs text-slate-400">
            Authentification simple par identifiant et mot de passe
          </p>
        </div>

        {}
        <Card className="bg-slate-900 border border-slate-800 shadow-xl p-6">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Adresse Email / Identifiant"
              type="text"
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

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={loading}
            >
              Se Connecter
            </Button>
          </form>

          {}
          <div className="mt-6 pt-5 border-t border-slate-800 text-left">
            <p className="text-xs font-mono text-slate-500 mb-2">Comptes Démo (1 clic) :</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('arthur.pendragon@42paris.fr')}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 transition-colors"
              >
                Arthur (42)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('neo.matrix@42paris.fr')}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 transition-colors"
              >
                Neo (42)
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Pas encore de compte ? S'inscrire
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
