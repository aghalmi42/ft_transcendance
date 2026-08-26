import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface StatusPageProps {
  onNavigate: (tabId: string) => void;
}

interface HealthReport {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  database: { status: string; latencyMs?: number; error?: string };
}

const formatUptime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

export const StatusPage: React.FC<StatusPageProps> = () => {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    try {
      const data = await api.getHealth();
      setReport(data);
      setError(null);
    } catch {
      setReport(null);
      setError('Backend injoignable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, [check]);

  const overallOk = report?.status === 'ok';
  const dbOk = report?.database.status === 'up';

  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full text-left font-sans animate-fadeIn">
      <div className="rounded-xl p-5 bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">État du service</h1>
          <p className="text-xs text-slate-400">Vérification automatique toutes les 15 secondes</p>
        </div>
        <Button variant="outline" size="sm" onClick={check} isLoading={loading}>
          Rafraîchir
        </Button>
      </div>

      <Card className="p-6 bg-slate-900 border-slate-800 text-center space-y-3">
        {error ? (
          <>
            <span className="text-4xl block">🔴</span>
            <h2 className="text-lg font-bold text-rose-400">Backend indisponible</h2>
            <p className="text-xs text-slate-400">{error}</p>
          </>
        ) : report ? (
          <>
            <span className="text-4xl block">{overallOk ? '🟢' : '🟠'}</span>
            <h2 className={`text-lg font-bold ${overallOk ? 'text-emerald-400' : 'text-amber-400'}`}>
              {overallOk ? 'Tous les systèmes sont opérationnels' : 'Service dégradé'}
            </h2>
            <p className="text-[11px] text-slate-500 font-mono">
              Dernière vérification : {new Date(report.timestamp).toLocaleTimeString()}
            </p>
          </>
        ) : (
          <p className="text-xs text-slate-500">Chargement...</p>
        )}
      </Card>

      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 bg-slate-900 border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">API Backend</span>
              <Badge variant="success" size="sm">En ligne</Badge>
            </div>
            <p className="text-[11px] text-slate-500">Disponible depuis {formatUptime(report.uptimeSeconds)}</p>
          </Card>

          <Card className="p-5 bg-slate-900 border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Base de données</span>
              <Badge variant={dbOk ? 'success' : 'danger'} size="sm">{dbOk ? 'Connectée' : 'Hors service'}</Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              {dbOk ? `Latence : ${report.database.latencyMs} ms` : report.database.error || 'Connexion impossible'}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StatusPage;
