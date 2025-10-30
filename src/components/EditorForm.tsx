import { useMemo } from 'react';
import type { DurationOption, Objective } from '../features/store/useScriptsStore';
import { TrendPicker } from './TrendPicker';
import { CodeChecklist } from './CodeChecklist';

const objectiveOptions: Objective[] = ['Alcance', 'Conexão', 'Conversão'];
const durationOptions: DurationOption[] = [20, 30, 40];
const nichePresets = ['Marketing Digital', 'Agronegócio', 'Educação', 'Saúde Integrativa', 'Tecnologia'];
const tonePresets = ['Conversacional', 'Autoridade amigável', 'Energia alta', 'Tom calmo', 'Instrutivo e direto'];

export interface EditorFormData {
  briefing: string;
  niche: string;
  objective: Objective;
  duration: DurationOption;
  tone: string;
  avatar: string;
  trends: string[];
  activeCodes: Record<string, boolean>;
}

interface EditorFormProps {
  value: EditorFormData;
  availableTrends: string[];
  onChange: (next: Partial<EditorFormData>) => void;
  onGenerate: () => void;
  onVaryHooks: () => void;
  onVaryCTAs: () => void;
}

export function EditorForm({ value, availableTrends, onChange, onGenerate, onVaryHooks, onVaryCTAs }: EditorFormProps) {
  const activeCount = useMemo(() => Object.values(value.activeCodes).filter(Boolean).length, [value.activeCodes]);

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onGenerate();
      }}
    >
      <section className="card" aria-labelledby="briefing-section">
        <header className="flex items-center justify-between">
          <div>
            <h3 id="briefing-section" className="section-title">
              Briefing e Avatar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Preencha com detalhes claros e objetivos.</p>
          </div>
          <span className="badge">Atalhos: G, S, D, P</span>
        </header>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span>Briefing</span>
            <textarea
              required
              value={value.briefing}
              onChange={(event) => onChange({ briefing: event.target.value })}
              rows={4}
              placeholder="Ex.: Aumentar produtividade das mudas de café em 30 dias"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span>Nicho</span>
              <select
                value={value.niche}
                onChange={(event) => onChange({ niche: event.target.value })}
              >
                <option value="">Escolha um nicho</option>
                {nichePresets.map((niche) => (
                  <option key={niche} value={niche}>
                    {niche}
                  </option>
                ))}
              </select>
              <input
                className="mt-2"
                value={value.niche}
                onChange={(event) => onChange({ niche: event.target.value })}
                placeholder="ou personalize o nicho"
              />
            </label>
            <label className="block">
              <span>Avatar</span>
              <input
                value={value.avatar}
                onChange={(event) => onChange({ avatar: event.target.value })}
                placeholder="Ex.: Gestores de fazendas de café especiais"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span>Objetivo</span>
              <select value={value.objective} onChange={(event) => onChange({ objective: event.target.value as Objective })}>
                {objectiveOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span>Duração alvo</span>
              <select
                value={value.duration}
                onChange={(event) => onChange({ duration: Number(event.target.value) as DurationOption })}
              >
                {durationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} segundos
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span>Tom de voz</span>
              <select
                value={tonePresets.includes(value.tone) ? value.tone : ''}
                onChange={(event) => onChange({ tone: event.target.value || value.tone })}
              >
                <option value="">Personalizado</option>
                {tonePresets.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
              <input
                className="mt-2"
                value={value.tone}
                onChange={(event) => onChange({ tone: event.target.value })}
                placeholder="Descreva o tom desejado"
              />
            </label>
          </div>
        </div>
      </section>

      <TrendPicker available={availableTrends} selected={value.trends} onChange={(trends) => onChange({ trends })} />

      <CodeChecklist
        activeCodes={value.activeCodes}
        onToggle={(id, checked) => onChange({ activeCodes: { ...value.activeCodes, [id]: checked } })}
      />

      <footer className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-slate-500 dark:text-slate-400">{activeCount} códigos aplicados nesta geração.</div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onVaryHooks} className="rounded-full border border-primary/30 px-3 py-2 text-xs font-semibold text-primary">
            Variar Ganchos
          </button>
          <button type="button" onClick={onVaryCTAs} className="rounded-full border border-primary/30 px-3 py-2 text-xs font-semibold text-primary">
            Variar CTAs
          </button>
          <button type="submit" className="btn">
            Gerar Roteiro
          </button>
        </div>
      </footer>
    </form>
  );
}
