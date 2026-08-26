import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { API_BASE_URL, api } from '../../services/api';

interface LandingPageProps {
  onLoginSuccess: () => void;
  onNavigateLegal?: (page: 'terms' | 'privacy' | 'gdpr' | 'status') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess, onNavigateLegal }) => {
  const { login, register, oauthError, clearOauthError } = useAuth();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fortyTwoAvailable, setFortyTwoAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (oauthError) {
      addToast(oauthError, 'error');
      clearOauthError();
    }
  }, [oauthError, addToast, clearOauthError]);

  useEffect(() => {
    api.getFortyTwoStatus().then(({ configured }) => setFortyTwoAvailable(configured));
  }, []);

  const handleFortyTwoLogin = () => {
    if (!fortyTwoAvailable) return;
    window.location.href = `${API_BASE_URL}/auth/42`;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Email requis';
    if (!password) errs.password = 'Mot de passe requis';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await login(email, password);
      addToast("Connexion réussie ! Bienvenue dans l'arène.", 'success');
      onLoginSuccess();
    } catch (err: any) {
      addToast(err?.message || 'Identifiants invalides', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!username || username.trim().length < 3) errs.username = 'Nom utilisateur : 3 car. min.';
    if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Adresse email invalide';
    if (!password || password.length < 6) errs.password = 'Mot de passe : 6 car. min.';
    if (password !== confirmPassword) errs.confirmPassword = 'Les mots de passe diffèrent';
    if (!agreed) errs.agreed = 'Veuillez accepter les CGU & RGPD';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
      addToast('Compte créé avec succès !', 'success');
      onLoginSuccess();
    } catch (err: any) {
      addToast(err?.message || "Erreur lors de l'inscription", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 font-sans text-left">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-lg">
            🏓
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">ft_transcendence</h1>
          <p className="text-xs text-slate-400">Arène de Pong RPG Multijoueur & Tournois 42</p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${activeTab === 'signin' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Connexion
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${activeTab === 'signup' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Inscription
          </button>
        </div>

        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <Input label="Email" type="email" placeholder="joueur@42.fr" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
            <Input label="Mot de passe" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} />
            <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full">
              Se Connecter 🚀
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-3">
            <Input label="Pseudo" type="text" placeholder="CyberPlayer42" value={username} onChange={e => setUsername(e.target.value)} error={errors.username} />
            <Input label="Email" type="email" placeholder="joueur@42.fr" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
            <Input label="Mot de passe" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} />
            <Input label="Confirmer mot de passe" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} error={errors.confirmPassword} />
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer pt-1">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="rounded border-slate-700 bg-slate-950 text-cyan-500" />
              <span>J'accepte les CGU et la politique RGPD</span>
            </label>
            {errors.agreed && <p className="text-[11px] text-rose-500">{errors.agreed}</p>}
            <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full">
              Créer mon Compte 🎮
            </Button>
          </form>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-[10px] text-slate-600 uppercase font-mono">
            <span className="flex-1 h-px bg-slate-800" />
            ou
            <span className="flex-1 h-px bg-slate-800" />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleFortyTwoLogin}
            disabled={!fortyTwoAvailable}
            title={fortyTwoAvailable === false ? "Non configuré côté serveur pour l'instant" : undefined}
          >
            {fortyTwoAvailable === false ? 'Connexion 42 non disponible' : 'Se connecter avec 42'}
          </Button>
        </div>

        {onNavigateLegal && (
          <div className="flex justify-center gap-4 text-[11px] text-slate-500 border-t border-slate-800 pt-4">
            <button onClick={() => onNavigateLegal('terms')} className="hover:text-slate-300">CGU</button>
            <span>•</span>
            <button onClick={() => onNavigateLegal('privacy')} className="hover:text-slate-300">Confidentialité</button>
            <span>•</span>
            <button onClick={() => onNavigateLegal('gdpr')} className="hover:text-slate-300">RGPD</button>
            <span>•</span>
            <button onClick={() => onNavigateLegal('status')} className="hover:text-slate-300">État du service</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default LandingPage;
