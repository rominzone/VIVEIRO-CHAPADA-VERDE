import { ScriptOutput } from '../features/store/useScriptsStore';

interface ScriptCardProps {
  output: ScriptOutput;
  title: string;
  onCopy: () => void;
  onDuplicate: () => void;
  onSave: () => void;
  onPlanner: () => void;
}

export function ScriptCard({ output, title, onCopy, onDuplicate, onSave, onPlanner }: ScriptCardProps) {
  return (
    <article className="card" aria-labelledby="script-title">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 id="script-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Gancho 0–3s • Desenvolvimento 4–25s • Virada 26–35s • CTA 36–40s</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onCopy} className="rounded-full border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary">
            Copiar
          </button>
          <button type="button" onClick={onDuplicate} className="rounded-full border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary">
            Duplicar
          </button>
          <button type="button" onClick={onSave} className="btn">
            Salvar
          </button>
          <button type="button" onClick={onPlanner} className="rounded-full border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary">
            Enviar pro Planner
          </button>
        </div>
      </header>

      <section className="mt-4 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-primary">Ganchos (0–3s)</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
            {output.hooks.map((hook, index) => (
              <li key={index} className="rounded-md bg-primary/5 px-3 py-2">
                {index + 1}. {hook}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-primary">Desenvolvimento (4–25s)</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
            {output.devBullets.map((bullet, index) => (
              <li key={index} className="rounded-md bg-slate-100 px-3 py-2 dark:bg-slate-700/60">
                • {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-primary">Virada (26–35s)</h4>
          <p className="mt-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-700/60 dark:text-slate-200">
            {output.twist}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-primary">CTAs (36–40s)</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
            {output.ctas.map((cta, index) => (
              <li key={index} className="rounded-md bg-primary/5 px-3 py-2">
                {index === 0 ? 'Soft' : 'Hard'}: {cta}
              </li>
            ))}
            {output.commentCTA && (
              <li className="rounded-md bg-slate-100 px-3 py-2 text-slate-600 dark:bg-slate-700/60 dark:text-slate-200">
                Comentários: {output.commentCTA}
              </li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-primary">Dica Extra</h4>
          <p className="mt-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-700/60 dark:text-slate-200">
            {output.tip}
          </p>
        </div>
        {output.meta?.platformVariations && (
          <div>
            <h4 className="text-sm font-semibold text-primary">Variações 3 em 1</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
              {output.meta.platformVariations.map((variation) => (
                <li key={variation.platform} className="rounded-md bg-slate-100 px-3 py-2 dark:bg-slate-700/60">
                  {variation.platform}: {variation.hook}
                </li>
              ))}
            </ul>
          </div>
        )}
        {output.meta?.plannerSuggestion && (
          <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-xs text-primary">
            {output.meta.plannerSuggestion}
          </div>
        )}
      </section>
    </article>
  );
}
