import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { TwoFactorModal } from '../auth/TwoFactorModal';

interface LandingPageProps {
  onLoginSuccess: () => void;
  onNavigateLegal?: (page: 'terms' | 'privacy' | 'gdpr') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginSuccess,
  onNavigateLegal,
}) => {
  const { login, register } = useAuth();
  const { addToast } = useNotification();

  const [activeAuthTab, setActiveAuthTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email) errs.email = "Email requis";
    if (!password) errs.password = "Mot de passe requis";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (email.includes('valkyrie') || email.includes('2fa')) {
      setShow2FA(true);
      return;
    }

    await executeLogin();
  };

  const executeLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      addToast("Connexion réussie ! Bienvenue dans l'arène.", "success");
      onLoginSuccess();
    } catch (err: any) {
      addToast(err?.message || "Identifiants invalides", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!username || username.trim().length < 3) errs.username = "Nom d'utilisateur : 3 car. min.";
    if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = "Adresse email invalide";
    if (!password || password.length < 6) errs.password = "Mot de passe : 6 car. min.";
    if (password !== confirmPassword) errs.confirmPassword = "Les mots de passe diffèrent";
    if (!agreed) errs.agreed = "Veuillez accepter les CGU & RGPD";

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
      addToast("Compte créé avec succès ! Bienvenue sur ft_transcendence.", "success");
      onLoginSuccess();
    } catch (err: any) {
      addToast(err?.message || "Erreur lors de l'inscription", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoUser: string) => {
    setEmail(demoEmail);
    setPassword("transcendence42!");
    setUsername(demoUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-violet-500 selection:text-white relative overflow-hidden">
      {/* Background Animated Neon Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-xl shadow-lg shadow-violet-500/30 ring-2 ring-violet-400/40">
            🏓
          </div>
          <div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent block">
              ft_transcendence
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
              {"Projet Majeur 42 • École 42"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="primary" size="md">
            {"🔒 Accès Authentifié Requis"}
          </Badge>
        </div>
      </header>

      {/* Main Hero & Auth Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1 z-10">
        {/* Left Column: Platform Presentation & Features */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/80 border border-violet-700/60 text-xs font-mono text-violet-300 shadow-sm">
              <span className="animate-pulse text-violet-400">●</span>
              <span>{"Plateforme Multijoueur 60 FPS • WebSockets & 2FA TOTP"}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              {"L'Arène Pong Rétro "}
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                {"Compétitive & RPG"}
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              {"Connectez-vous pour affronter des joueurs en direct avec 4 classes de héros, des sorts ultimes cosmiques, des tournois à élimination directe, un chat instantané et une sécurité à deux facteurs."}
            </p>
          </div>

          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/40 transition-all space-y-1.5 shadow-lg">
              <div className="text-2xl">🏓</div>
              <h3 className="font-bold text-slate-100 text-sm">{"Pong RPG 1v1 à 4v4"}</h3>
              <p className="text-xs text-slate-400">
                {"4 classes uniques (Shooter, Slayer, Support, Tank) et 16 sorts opérationnels."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-1.5 shadow-lg">
              <div className="text-2xl">🌐</div>
              <h3 className="font-bold text-slate-100 text-sm">{"Temps Réel WebSockets"}</h3>
              <p className="text-xs text-slate-400">
                {"Matchmaking instantané, synchronisation 60 Hz et salons de discussion."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all space-y-1.5 shadow-lg">
              <div className="text-2xl">🏆</div>
              <h3 className="font-bold text-slate-100 text-sm">{"Tournois & Matchmaking ELO"}</h3>
              <p className="text-xs text-slate-400">
                {"Arbres à élimination directe à 4 ou 8 joueurs et classement en temps réel."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-1.5 shadow-lg">
              <div className="text-2xl">🔐</div>
              <h3 className="font-bold text-slate-100 text-sm">{"Sécurité 2FA & RGPD"}</h3>
              <p className="text-xs text-slate-400">
                {"Google Authenticator TOTP RFC 6238, tokens JWT et export complet de données."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Sign In / Sign Up Gate */}
        <div className="lg:col-span-5 w-full">
          <Card glowColor="purple" className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl rounded-3xl text-left space-y-6">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setActiveAuthTab('signin'); setErrors({}); }}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeAuthTab === 'signin'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {"🔑 Se Connecter"}
              </button>
              <button
                type="button"
                onClick={() => { setActiveAuthTab('signup'); setErrors({}); }}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeAuthTab === 'signup'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {"✨ S'Inscrire"}
              </button>
            </div>

            {/* Sign In Form */}
            {activeAuthTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4 animate-fadeIn">
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

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={loading}
                >
                  {"Entrer dans l'Arène"}
                </Button>

                {/* Demo Quick Logins */}
                <div className="pt-4 border-t border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block text-center">
                    {"🚀 Comptes de démonstration rapide :"}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('admin@admin.fr', 'Administrator')}
                      className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-[11px] font-bold text-amber-300 transition-all cursor-pointer shadow-md shadow-amber-500/10"
                    >
                      {"👑 Admin"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('ponger@transcendence.42', 'CyberPonger')}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 transition-all cursor-pointer"
                    >
                      {"🎮 Joueur 1"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('valkyrie@transcendence.42', 'NeonValkyrie')}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 transition-all cursor-pointer"
                      title="Compte protégé par 2FA"
                    >
                      {"⚡ 2FA Démo"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('knight@transcendence.42', 'PixelKnight')}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 transition-all cursor-pointer"
                    >
                      {"🛡️ Joueur 3"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Sign Up Form */}
            {activeAuthTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5 animate-fadeIn">
                <Input
                  label="Nom d'utilisateur"
                  type="text"
                  placeholder="ex: CyberWarrior"
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
                  label="Mot de passe (6 car. min.)"
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

                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-300 pt-1">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500"
                  />
                  <span>
                    {"J'accepte les "}
                    <button
                      type="button"
                      onClick={() => onNavigateLegal?.('terms')}
                      className="text-violet-400 underline"
                    >
                      {"CGU"}
                    </button>
                    {" et la politique "}
                    <button
                      type="button"
                      onClick={() => onNavigateLegal?.('privacy')}
                      className="text-violet-400 underline"
                    >
                      {"RGPD"}
                    </button>
                    {"."}
                  </span>
                </label>
                {errors.agreed && <p className="text-xs text-rose-400">{errors.agreed}</p>}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={loading}
                >
                  {"Créer mon Compte"}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
        <p>{`© ${new Date().getFullYear()} ft_transcendence • École 42. Tous droits réservés.`}</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigateLegal?.('terms')}
            className="hover:text-slate-200 transition-colors"
          >
            {"Conditions d'Utilisation"}
          </button>
          <button
            type="button"
            onClick={() => onNavigateLegal?.('privacy')}
            className="hover:text-slate-200 transition-colors"
          >
            {"Politique de Confidentialité"}
          </button>
          <button
            type="button"
            onClick={() => onNavigateLegal?.('gdpr')}
            className="hover:text-slate-200 transition-colors"
          >
            {"Centre RGPD"}
          </button>
        </div>
      </footer>

      {/* 2FA Modal */}
      <TwoFactorModal
        isOpen={show2FA}
        onClose={() => setShow2FA(false)}
        onSuccess={executeLogin}
      />
    </div>
  );
};

export default LandingPage;
