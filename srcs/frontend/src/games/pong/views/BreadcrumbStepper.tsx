import React from 'react';
import type { SelectionStep } from '../types';

interface BreadcrumbStepperProps {
  step: SelectionStep;
  onStepClick?: (step: SelectionStep) => void;
}

export const BreadcrumbStepper: React.FC<BreadcrumbStepperProps> = ({ step, onStepClick }) => {
  const steps: { id: SelectionStep; label: string; activeColor: string }[] = [
    { id: 'MODE_SELECT', label: '1. Mode de Jeu', activeColor: 'bg-violet-950/80 border-violet-500 text-violet-300 ring-2 ring-violet-500/50' },
    { id: 'CONTROLS_SELECT', label: '2. Touches', activeColor: 'bg-cyan-950/80 border-cyan-500 text-cyan-300 ring-2 ring-cyan-500/50' },
    { id: 'CHAMP_SELECT', label: '3. Champion', activeColor: 'bg-violet-950/80 border-violet-500 text-violet-300 ring-2 ring-violet-500/50' },
    { id: 'MAP_SELECT', label: '4. Map', activeColor: 'bg-amber-950/80 border-amber-500 text-amber-300 ring-2 ring-amber-500/50' },
    { id: 'IN_GAME', label: '5. Jeu', activeColor: 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/50' },
  ];

  return (
    <div className="flex items-center justify-start sm:justify-center space-x-2 sm:space-x-3 mb-4 text-xs font-mono font-bold overflow-x-auto py-1 max-w-full no-scrollbar">
      {steps.map((s, idx) => {
        const isCurrent = step === s.id;
        return (
          <React.Fragment key={s.id}>
            <button
              onClick={() => onStepClick?.(s.id)}
              className={`px-3 sm:px-3.5 py-2 rounded-xl border transition-all cursor-pointer shadow-md shrink-0 ${
                isCurrent
                  ? `${s.activeColor} scale-105`
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {s.label}
            </button>
            {idx < steps.length - 1 && <span className="text-slate-600 shrink-0">{" >> "}</span>}
          </React.Fragment>
        );
      })}

      {step === 'GAME_OVER' && (
        <>
          <span className="text-slate-600">{" >> "}</span>
          <span className="px-3.5 py-2 rounded-xl border bg-rose-950/80 border-rose-500 text-rose-300 ring-2 ring-rose-500/50 shadow-md">
            {"6. Résultats"}
          </span>
        </>
      )}
    </div>
  );
};

export default BreadcrumbStepper;
