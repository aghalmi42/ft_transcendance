import React from 'react';

interface FooterProps {
  onNavigate: (tabId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-950/90 border-t border-slate-800/80 py-6 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">

        {/* Left info */}
        <div className="flex items-center gap-3 text-left">
          <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-sm">
            🏓
          </div>
          <div>
            <p className="font-bold text-slate-200">{"ft_transcendence — 42 Paris"}</p>
            <p className="text-[11px] text-slate-400">{"Plateforme Social Gaming & Tournois Pong"}</p>
          </div>
        </div>

        {/* Center: Mandatory Legal & Compliance Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
          <button
            onClick={() => onNavigate('about')}
            className="hover:text-violet-400 transition-colors cursor-pointer underline-offset-4 hover:underline text-slate-300 font-semibold"
          >
            {"À propos"}
          </button>
          <button
            onClick={() => onNavigate('gdpr')}
            className="hover:text-cyan-400 transition-colors cursor-pointer underline-offset-4 hover:underline text-cyan-400 font-semibold"
          >
            {"Centre RGPD & Confidentialité"}
          </button>
          <button
            onClick={() => onNavigate('terms')}
            className="hover:text-violet-400 transition-colors cursor-pointer underline-offset-4 hover:underline"
          >
            {"Conditions Générales"}
          </button>
          <button
            onClick={() => onNavigate('privacy')}
            className="hover:text-violet-400 transition-colors cursor-pointer underline-offset-4 hover:underline"
          >
            {"Politique de Données"}
          </button>
        </div>

        {/* Right copyright */}
        <div className="text-[11px] text-slate-400 text-center md:text-right">
          <p>{`© ${new Date().getFullYear()} ft_transcendence. Tous droits réservés.`}</p>
          <p className="text-slate-400">{"Construit avec React 19, TypeScript & NestJS"}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
