import React from 'react';
import Card from '../common/Card';
import { Badge } from '../common/Badge';
import Button from '../common/Button';

interface AboutViewProps {
  onNavigate: (tabId: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full animate-fadeIn text-left">
      {}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 bg-gradient-to-r from-violet-950/80 via-slate-900 to-cyan-950/70 border border-violet-500/30 shadow-2xl">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/30 border border-violet-400/40 text-violet-200 text-xs font-mono font-bold">
            <span>ℹ️</span>
            <span>PROJET MAJEUR ÉCOLE 42</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            À propos de ft_transcendence
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Dernier projet du cursus commun de l'École 42, ft_transcendence est une plateforme web complète alliant multijoueur temps réel, architecture micro-services, sécurité renforcée et gameplay innovant.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 space-y-3 border-violet-500/30 bg-slate-900/80">
          <div className="text-2xl">🎨</div>
          <h4 className="text-base font-extrabold text-white">Frontend Moderne</h4>
          <p className="text-xs text-slate-300">
            React 19 & TypeScript orchestrés par Vite. Moteur Canvas 60 FPS avec système de particules, thème dark cyber et Tailwind CSS.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge variant="purple" size="sm">React 19</Badge>
            <Badge variant="purple" size="sm">TypeScript</Badge>
            <Badge variant="purple" size="sm">Tailwind CSS</Badge>
          </div>
        </Card>

        <Card className="p-5 space-y-3 border-cyan-500/30 bg-slate-900/80">
          <div className="text-2xl">⚡</div>
          <h4 className="text-base font-extrabold text-white">Backend & WebSockets</h4>
          <p className="text-xs text-slate-300">
            NestJS avec architecture modulaire. Passerelle temps réel Socket.io pour le chat IRC, la présence des utilisateurs et la physique Pong synchronisée.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge variant="info" size="sm">NestJS</Badge>
            <Badge variant="info" size="sm">Socket.io</Badge>
            <Badge variant="info" size="sm">JWT</Badge>

          </div>
        </Card>

        <Card className="p-5 space-y-3 border-emerald-500/30 bg-slate-900/80">
          <div className="text-2xl">💾</div>
          <h4 className="text-base font-extrabold text-white">Données & Infrastructure</h4>
          <p className="text-xs text-slate-300">
            PostgreSQL 16 orchestré avec TypeORM. Déploiement conteneurisé Docker Compose avec reverse proxy Nginx et conformité stricte RGPD.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge variant="success" size="sm">PostgreSQL</Badge>
            <Badge variant="success" size="sm">Docker</Badge>
            <Badge variant="success" size="sm">RGPD Ready</Badge>
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🏛️</span> Conformité & Normes École 42
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Cette application a été développée en conformité avec le cahier des charges officiel : authentification sécurisée par JWT, protection contre les failles CSRF/XSS, base de données relationnelle persistante et gestion des salons de discussion.
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <Button variant="gradient" size="sm" onClick={() => onNavigate('game')}>
            🏓 Lancer le Pong RPG
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onNavigate('gdpr')}>
            🛡️ Centre de Confidentialité & RGPD
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AboutView;
