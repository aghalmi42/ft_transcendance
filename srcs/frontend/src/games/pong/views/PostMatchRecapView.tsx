import React from 'react';
import type { GameOverData } from '../types';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';

interface PostMatchRecapViewProps {
  data?: GameOverData;
  gameOverData?: GameOverData;
  onPlayAgain: () => void;
  onGoToModeSelect?: () => void;
  onChangeMap?: () => void;
  onGoToChampSelect?: () => void;
  onChangeChampion?: () => void;
}

export const PostMatchRecapView: React.FC<PostMatchRecapViewProps> = ({
  data,
  gameOverData: explicitGameOverData,
  onPlayAgain,
  onGoToModeSelect,
  onChangeMap,
  onGoToChampSelect,
  onChangeChampion,
}) => {
  const matchData = data || explicitGameOverData;
  const handleMapSelect = onChangeMap || onGoToModeSelect || (() => {});
  const handleChampSelect = onChangeChampion || onGoToChampSelect || (() => {});

  if (!matchData) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Aucune donnée de match disponible.</p>
        <Button variant="primary" onClick={onPlayAgain} className="mt-4">Retour au Menu</Button>
      </div>
    );
  }

  const human = matchData.players.find(p => p.isHuman);
  const isHumanBlue = human ? human.team === 'BLUE' : true;
  const isVictory = (isHumanBlue && matchData.winner === 'BLUE') || (!isHumanBlue && matchData.winner === 'RED');

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto text-left font-sans animate-fadeIn pb-12">
      <div className={`p-8 rounded-3xl border shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 ${isVictory ? 'bg-gradient-to-br from-emerald-950 to-slate-900 border-emerald-500/50' : 'bg-gradient-to-br from-rose-950 to-slate-900 border-rose-500/50'}`}>
        <div>
          <span className="text-xs font-mono uppercase font-bold tracking-wider text-slate-400">RÉCAPITULATIF DE FIN DE MATCH</span>
          <h1 className="text-3xl font-black text-white mt-1">
            {isVictory ? '🏆 VICTOIRE ÉCLATANTE !' : '💀 DÉFAITE'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Score Final : <span className="font-bold font-mono text-cyan-300">{matchData.scoreBlue} - {matchData.scoreRed}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="lg" onClick={onPlayAgain}>Rejouer 🚀</Button>
          <Button variant="secondary" size="md" onClick={handleChampSelect}>Changer Champion</Button>
          <Button variant="ghost" size="md" onClick={handleMapSelect}>Modes & Cartes</Button>
        </div>
      </div>

      <Card title="Tableau des Scores & Statistiques" subtitle="Détail des dégâts et éliminations">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2">Joueur</th>
                <th className="py-2">Rôle</th>
                <th className="py-2 text-center">K / D</th>
                <th className="py-2 text-right">Dégâts</th>
                <th className="py-2 text-right">Tanké</th>
                <th className="py-2 text-right">Soins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {matchData.players.map(p => (
                <tr key={p.id} className={p.isHuman ? 'bg-slate-900/60 text-white font-bold' : 'text-slate-300'}>
                  <td className="py-2.5 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${p.team === 'BLUE' ? 'bg-cyan-400' : 'bg-rose-400'}`} />
                    <span>{p.name} {p.isHuman && '(Vous)'}</span>
                  </td>
                  <td className="py-2.5 text-slate-400">{p.role}</td>
                  <td className="py-2.5 text-center text-amber-300">{p.kills} / {p.deaths}</td>
                  <td className="py-2.5 text-right text-rose-400">{p.damageDealt.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-cyan-400">{p.damageTanked.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-emerald-400">{p.healingProvided.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default PostMatchRecapView;
