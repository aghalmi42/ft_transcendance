import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface PrivacyPolicyProps {
  onNavigate: (tabId: string) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full text-left">
      <div className="flex items-center justify-between bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <span>🛡️</span> {"Politique de Confidentialité & RGPD"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {"Conforme au Règlement Général sur la Protection des Données (RGPD - UE 2016/679)"}
          </p>
        </div>

        <Button variant="neon" size="sm" onClick={() => onNavigate('gdpr')}>
          {"Espace Export RGPD →"}
        </Button>
      </div>

      <Card className="space-y-6 text-xs text-slate-300 leading-relaxed p-6 sm:p-8">
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-violet-400">
            {"1. Données Personnelles Collectées"}
          </h3>
          <p>
            {"Dans le cadre de l'utilisation de "}
            <strong>ft_transcendence</strong>
            {", nous collectons un minimum strict de données personnelles nécessaires au fonctionnement du service :"}
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li><strong>{"Données de compte : "}</strong>{"Nom d'utilisateur (pseudonyme), adresse email, mot de passe haché par algorithme sécurisé (Bcrypt)."}</li>
            <li><strong>{"Données de profil : "}</strong>{"Avatar choisi, biographie personnalisée, statut de présence (en ligne, en jeu, etc.)."}</li>
            <li><strong>{"Données d'activité de jeu : "}</strong>{"Historique des parties, scores, ratio victoires/défaites, succès débloqués."}</li>
            <li><strong>{"Données sociales : "}</strong>{"Publications, commentaires, liste d'amis et messages privés instantanés."}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-violet-400">
            {"2. Finalités du Traitement"}
          </h3>
          <p>
            {"Vos informations sont utilisées exclusivement pour :"}
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>{"Gérer votre compte utilisateur et assurer l'authentification sécurisée (JWT)."}</li>
            <li>{"Calculer les classements et synchroniser les parties multi-joueurs en temps réel."}</li>
            <li>{"Faciliter la mise en relation avec d'autres joueurs de l'école 42."}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-violet-400">
            {"3. Durée de Conservation & Droits"}
          </h3>
          <p>
            {"Vos données sont conservées tant que votre compte reste actif. Vous pouvez à tout moment exporter ou supprimer définitivement vos données depuis le centre RGPD."}
          </p>
        </section>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
