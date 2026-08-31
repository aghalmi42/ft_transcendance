import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface TermsOfServiceProps {
  onNavigate: (tabId: string) => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full text-left">
      <div className="flex items-center justify-between bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <span>📜</span> {"Conditions Générales d'Utilisation (CGU)"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {"Dernière mise à jour : 21 Août 2026 • Plateforme ft_transcendence"}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => onNavigate('privacy')}>
          {"Politique de Confidentialité →"}
        </Button>
      </div>

      <Card className="space-y-6 text-xs text-slate-300 leading-relaxed p-6 sm:p-8">
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-violet-400">
            {"1. Objet et Présentation de la Plateforme"}
          </h3>
          <p>
            {"Les présentes Conditions Générales d'Utilisation régissent l'accès et l'utilisation de la plateforme web "}
            <strong>ft_transcendence</strong>
            {", développée dans le cadre du cursus de l'école 42. La plateforme propose des fonctionnalités de réseau social, de messagerie instantanée, ainsi que des arènes de jeux multi-joueurs en temps réel."}
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-violet-400">
            {"2. Inscription et Sécurité des Comptes"}
          </h3>
          <p>
            {"L'accès aux fonctionnalités de jeu et d'interaction sociale nécessite la création d'un compte utilisateur personnel. Chaque utilisateur s'engage à fournir des informations exactes lors de son inscription."}
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>{"L'utilisateur est seul responsable de la confidentialité de ses identifiants et de son mot de passe."}</li>
            <li>{"Tout accès frauduleux ou tentative d'usurpation d'identité entraînera la suspension immédiate du compte."}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-violet-400">
            {"3. Règles de Conduite et Fair-play"}
          </h3>
          <p>
            {"Les utilisateurs s'engagent à respecter une charte de convivialité et d'intégrité sportive dans les parties en ligne et les espaces d'échange :"}
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li><strong>{"Fair-play : "}</strong>{"Toute utilisation de scripts de triche, bots non autorisés modifiant la physique du jeu, ou exploitation de failles logicielles est strictement interdite."}</li>
            <li><strong>{"Respect mutuel : "}</strong>{"Aucun propos haineux, diffamatoire, discriminatoire ou harcèlement ne sera toléré dans le chat ou les publications du fil d'actualité."}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-violet-400">
            {"4. Protection des Données Personnelles (RGPD)"}
          </h3>
          <p>
            {"Conformément au Règlement Général sur la Protection des Données (RGPD), l'utilisateur dispose d'un droit d'accès, de rectification, de portabilité et de suppression de ses données personnelles à tout moment depuis son espace dédié."}
          </p>
        </section>
      </Card>
    </div>
  );
};

export default TermsOfService;
