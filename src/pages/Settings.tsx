import { useState } from 'react';
import { useScriptsStore } from '../features/store/useScriptsStore';
import { useToast } from '../components/Toast';

export function Settings() {
  const { settings, updateSettings } = useScriptsStore();
  const { pushToast } = useToast();
  const [newTrend, setNewTrend] = useState('');
  const [newForbidden, setNewForbidden] = useState('');

  const addTrend = () => {
    const trimmed = newTrend.trim();
    if (!trimmed) return;
    if (settings.trends.includes(trimmed)) {
      pushToast('Trend já cadastrada', 'info');
      return;
    }
    updateSettings({ trends: [...settings.trends, trimmed] });
    setNewTrend('');
    pushToast('Trend adicionada', 'success');
  };

  const removeTrend = (trend: string) => {
    updateSettings({ trends: settings.trends.filter((item) => item !== trend) });
  };

  const addForbidden = () => {
    const trimmed = newForbidden.trim();
    if (!trimmed) return;
    if (settings.forbiddenWords.includes(trimmed)) {
      pushToast('Palavra já bloqueada', 'info');
      return;
    }
    updateSettings({ forbiddenWords: [...settings.forbiddenWords, trimmed] });
    setNewForbidden('');
    pushToast('Palavra adicionada ao bloqueio', 'success');
  };

  const removeForbidden = (word: string) => {
    updateSettings({ forbiddenWords: settings.forbiddenWords.filter((item) => item !== word) });
  };

  return (
    <div className="space-y-6">
      <section className="card" aria-labelledby="settings-preferences">
        <h2 id="settings-preferences" className="section-title">
          Preferências principais
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Nicho padrão</span>
            <input
              value={settings.defaultNiche}
              onChange={(event) => updateSettings({ defaultNiche: event.target.value })}
              placeholder="Ex.: Agronegócio"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Objetivo padrão</span>
            <select
              value={settings.defaultObjective}
              onChange={(event) => updateSettings({ defaultObjective: event.target.value as typeof settings.defaultObjective })}
            >
              {['Alcance', 'Conexão', 'Conversão'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Duração padrão</span>
            <select
              value={settings.defaultDuration}
              onChange={(event) => updateSettings({ defaultDuration: Number(event.target.value) as typeof settings.defaultDuration })}
            >
              {[20, 30, 40].map((option) => (
                <option key={option} value={option}>
                  {option} segundos
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Tom de voz padrão</span>
            <input
              value={settings.defaultTone}
              onChange={(event) => updateSettings({ defaultTone: event.target.value })}
              placeholder="Conversacional e direto"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Plataforma padrão</span>
            <select
              value={settings.defaultPlatform}
              onChange={(event) => updateSettings({ defaultPlatform: event.target.value })}
            >
              {['Reels', 'TikTok', 'Shorts', 'Kwai'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="card" aria-labelledby="settings-trends">
        <h2 id="settings-trends" className="section-title">
          Trends internas
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {settings.trends.map((trend) => (
            <span key={trend} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              {trend}
              <button
                type="button"
                onClick={() => removeTrend(trend)}
                aria-label={`Remover ${trend}`}
                className="text-[10px] uppercase"
              >
                ×
              </button>
            </span>
          ))}
          {settings.trends.length === 0 && <span className="text-xs text-slate-500 dark:text-slate-400">Nenhuma trend cadastrada.</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={newTrend}
            onChange={(event) => setNewTrend(event.target.value)}
            placeholder="Adicionar nova trend"
            className="w-full max-w-sm"
          />
          <button type="button" onClick={addTrend} className="btn">
            Adicionar trend
          </button>
        </div>
      </section>

      <section className="card" aria-labelledby="settings-forbidden">
        <h2 id="settings-forbidden" className="section-title">
          Vocabulário bloqueado
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {settings.forbiddenWords.map((word) => (
            <span key={word} className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-600">
              {word}
              <button
                type="button"
                onClick={() => removeForbidden(word)}
                aria-label={`Remover ${word}`}
                className="text-[10px] uppercase"
              >
                ×
              </button>
            </span>
          ))}
          {settings.forbiddenWords.length === 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">Nenhuma palavra bloqueada.</span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={newForbidden}
            onChange={(event) => setNewForbidden(event.target.value)}
            placeholder="Adicionar palavra proibida"
            className="w-full max-w-sm"
          />
          <button type="button" onClick={addForbidden} className="btn">
            Bloquear palavra
          </button>
        </div>
      </section>
    </div>
  );
}
