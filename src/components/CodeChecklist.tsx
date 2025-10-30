import { CODE_DETAILS } from '../features/generator/rules';

interface CodeChecklistProps {
  activeCodes: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void;
}

export function CodeChecklist({ activeCodes, onToggle }: CodeChecklistProps) {
  return (
    <section className="card" aria-labelledby="code-checklist">
      <div className="flex items-center justify-between">
        <h3 id="code-checklist" className="section-title">
          19 Códigos da Viralização
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">Ativos: {Object.values(activeCodes).filter(Boolean).length}</span>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Desmarque para relaxar alguma regra nesta geração.
      </p>
      <ul className="mt-3 grid gap-2 md:grid-cols-2" role="group" aria-label="Selecione quais códigos aplicar">
        {CODE_DETAILS.map((code) => (
          <li key={code.id} className="flex items-start gap-2 rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700">
            <input
              type="checkbox"
              checked={activeCodes[code.id] ?? true}
              onChange={(event) => onToggle(code.id, event.target.checked)}
              className="mt-1"
              id={`code-${code.id}`}
            />
            <label htmlFor={`code-${code.id}`} className="flex-1">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{code.label}</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">{code.description}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
