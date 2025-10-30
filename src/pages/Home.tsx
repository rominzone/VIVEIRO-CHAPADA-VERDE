import { useCallback, useEffect, useMemo, useState } from 'react';
import { EditorForm, EditorFormData } from '../components/EditorForm';
import { ScriptCard } from '../components/ScriptCard';
import { Script, plannerDefaultTimes, useScriptsStore } from '../features/store/useScriptsStore';
import { generateScript } from '../features/generator/generate';
import { CODE_DETAILS } from '../features/generator/rules';
import { useToast } from '../components/Toast';
import { nanoid } from 'nanoid';

const defaultCodes = CODE_DETAILS.reduce<Record<string, boolean>>((acc, code) => {
  acc[code.id] = true;
  return acc;
}, {});

interface HomeProps {
  selectedScript?: Script | null;
  onClearSelection?: () => void;
}

export function Home({ selectedScript, onClearSelection }: HomeProps) {
  const { settings, addScript, createEmptyScript, upsertPlanner, scripts } = useScriptsStore();
  const { pushToast } = useToast();
  const [currentTitle, setCurrentTitle] = useState('Roteiro Viral Inédito');
  const [output, setOutput] = useState(() => createEmptyScript().output);
  const [lastSavedScript, setLastSavedScript] = useState<Script | null>(null);
  const [editorState, setEditorState] = useState<EditorFormData>(() => ({
    briefing: '',
    niche: settings.defaultNiche || '',
    objective: settings.defaultObjective,
    duration: settings.defaultDuration,
    tone: settings.defaultTone,
    avatar: '',
    trends: settings.trends.slice(0, 2),
    activeCodes: { ...defaultCodes }
  }));

  useEffect(() => {
    setEditorState((state) => ({
      ...state,
      trends: state.trends.length ? state.trends : settings.trends.slice(0, 2),
      tone: state.tone || settings.defaultTone,
      objective: state.objective ?? settings.defaultObjective,
      duration: state.duration ?? settings.defaultDuration
    }));
  }, [settings.defaultTone, settings.defaultObjective, settings.defaultDuration, settings.trends]);

  useEffect(() => {
    if (selectedScript !== null) return;
    const blank = createEmptyScript();
    setEditorState({
      briefing: '',
      niche: settings.defaultNiche || '',
      objective: settings.defaultObjective,
      duration: settings.defaultDuration,
      tone: settings.defaultTone,
      avatar: '',
      trends: settings.trends.slice(0, 2),
      activeCodes: { ...defaultCodes }
    });
    setOutput(blank.output);
    setCurrentTitle(blank.title);
    setLastSavedScript(null);
  }, [createEmptyScript, selectedScript, settings.defaultDuration, settings.defaultNiche, settings.defaultObjective, settings.defaultTone, settings.trends]);

  useEffect(() => {
    setLastSavedScript(null);
  }, [
    editorState.briefing,
    editorState.niche,
    editorState.objective,
    editorState.duration,
    editorState.tone,
    editorState.trends,
    editorState.activeCodes
  ]);

  useEffect(() => {
    if (!selectedScript) return;
    setEditorState((state) => ({
      ...state,
      briefing: selectedScript.briefing,
      niche: selectedScript.niche,
      objective: selectedScript.objective,
      duration: selectedScript.duration,
      tone: selectedScript.tone,
      trends: selectedScript.trends,
      activeCodes: {
        ...defaultCodes,
        ...selectedScript.codesApplied.reduce<Record<string, boolean>>((acc, code) => {
          acc[code] = true;
          return acc;
        }, {})
      }
    }));
    setOutput(selectedScript.output);
    setCurrentTitle(selectedScript.title);
    setLastSavedScript(selectedScript);
    pushToast('Roteiro carregado do acervo', 'info');
  }, [selectedScript, pushToast]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      const key = event.key.toLowerCase();
      if (key === 'g') {
        event.preventDefault();
        handleGenerate();
      }
      if (key === 's') {
        event.preventDefault();
        handleSave();
      }
      if (key === 'd') {
        event.preventDefault();
        handleVaryHooks();
      }
      if (key === 'p') {
        event.preventDefault();
        handleSendToPlanner();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleGenerate, handleSave, handleSendToPlanner, handleVaryHooks]);

  const constancyMessage = useMemo(() => {
    if (scripts.length >= 3) return 'Parabéns! Você já tem base para 3 posts nesta semana.';
    const missing = 3 - scripts.length;
    return `Constância: planeje mais ${missing} roteiros para completar a semana.`;
  }, [scripts.length]);

  const handleGenerate = useCallback(() => {
    if (!editorState.briefing.trim()) {
      pushToast('Inclua um briefing antes de gerar', 'error');
      return;
    }
    const result = generateScript({
      briefing: editorState.briefing,
      niche: editorState.niche || settings.defaultNiche,
      objective: editorState.objective,
      duration: editorState.duration,
      tone: editorState.tone,
      trends: editorState.trends,
      activeCodes: editorState.activeCodes,
      forbiddenWords: settings.forbiddenWords
    });
    setOutput(result);
    setCurrentTitle(result.title);
    pushToast('Roteiro gerado com sucesso!', 'success');
  }, [editorState.activeCodes, editorState.briefing, editorState.duration, editorState.niche, editorState.objective, editorState.tone, editorState.trends, pushToast, settings.defaultNiche, settings.forbiddenWords]);

  const handleVaryHooks = useCallback(() => {
    const newOutput = generateScript({
      briefing: editorState.briefing,
      niche: editorState.niche,
      objective: editorState.objective,
      duration: editorState.duration,
      tone: editorState.tone,
      trends: editorState.trends,
      activeCodes: { ...editorState.activeCodes, gancho: true },
      forbiddenWords: settings.forbiddenWords
    });
    setOutput((prev) => ({ ...prev, hooks: newOutput.hooks }));
    pushToast('Novas variações de ganchos geradas', 'info');
  }, [editorState.activeCodes, editorState.briefing, editorState.duration, editorState.niche, editorState.objective, editorState.tone, editorState.trends, pushToast, settings.forbiddenWords]);

  const handleVaryCTAs = useCallback(() => {
    const newOutput = generateScript({
      briefing: editorState.briefing,
      niche: editorState.niche,
      objective: editorState.objective,
      duration: editorState.duration,
      tone: editorState.tone,
      trends: editorState.trends,
      activeCodes: { ...editorState.activeCodes, cta: true },
      forbiddenWords: settings.forbiddenWords
    });
    setOutput((prev) => ({ ...prev, ctas: newOutput.ctas, commentCTA: newOutput.commentCTA }));
    pushToast('CTAs atualizados com sucesso', 'info');
  }, [editorState.activeCodes, editorState.briefing, editorState.duration, editorState.niche, editorState.objective, editorState.tone, editorState.trends, pushToast, settings.forbiddenWords]);

  const handleCopy = useCallback(async () => {
    const content = `Título: ${currentTitle}\nGancho: ${output.hooks.join(' / ')}\nDesenvolvimento:\n- ${output.devBullets.join('\n- ')}\nVirada: ${output.twist}\nCTAs: ${output.ctas.join(' | ')}\nComentário: ${output.commentCTA ?? ''}\nDica: ${output.tip}`;
    try {
      await navigator.clipboard.writeText(content);
      pushToast('Roteiro copiado para a área de transferência', 'success');
    } catch (error) {
      console.error(error);
      pushToast('Não foi possível copiar automaticamente', 'error');
    }
  }, [currentTitle, output, pushToast]);

  const handleSave = useCallback(() => {
    const script = createEmptyScript();
    const now = new Date().toISOString();
    const scriptToSave: Script = {
      ...script,
      title: currentTitle,
      briefing: editorState.briefing,
      niche: editorState.niche,
      objective: editorState.objective,
      duration: editorState.duration,
      tone: editorState.tone,
      trends: editorState.trends,
      codesApplied: Object.entries(editorState.activeCodes)
        .filter(([, active]) => active)
        .map(([id]) => id),
      output,
      updatedAt: now,
      createdAt: now
    };
    addScript(scriptToSave);
    setLastSavedScript(scriptToSave);
    pushToast('Roteiro salvo com sucesso', 'success');
    return scriptToSave;
  }, [addScript, createEmptyScript, currentTitle, editorState.activeCodes, editorState.briefing, editorState.duration, editorState.niche, editorState.objective, editorState.tone, editorState.trends, output, pushToast]);

  const handleSendToPlanner = useCallback(() => {
    const scriptReference = lastSavedScript ?? handleSave();
    if (!scriptReference) return;
    const entryId = nanoid();
    upsertPlanner({
      id: entryId,
      scriptId: scriptReference.id,
      dateISO: new Date().toISOString().slice(0, 10),
      platform: settings.defaultPlatform,
      caption: `Resumo: ${output.devBullets[0] ?? ''}`,
      hashtags: ['#viral', '#conteudo'],
      status: 'Rascunho',
      suggestedTimes: plannerDefaultTimes[settings.defaultPlatform] ?? ['11:30', '19:00']
    });
    pushToast('Roteiro enviado para o Planner! Ajuste a data no calendário.', 'success');
  }, [handleSave, lastSavedScript, output.devBullets, pushToast, settings.defaultPlatform, upsertPlanner]);

  const updateEditor = useCallback((next: Partial<EditorFormData>) => {
    setEditorState((state) => ({
      ...state,
      ...next,
      activeCodes: next.activeCodes ? next.activeCodes : state.activeCodes
    }));
  }, []);

  return (
    <div className="space-y-6">
      {selectedScript && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
          <span>
            Editando: <strong>{selectedScript.title}</strong>
          </span>
          {onClearSelection && (
            <button
              onClick={onClearSelection}
              className="rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold text-primary"
            >
              Limpar seleção
            </button>
          )}
        </div>
      )}
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
        {constancyMessage}
      </div>
      <EditorForm
        value={editorState}
        availableTrends={settings.trends}
        onChange={updateEditor}
        onGenerate={handleGenerate}
        onVaryHooks={handleVaryHooks}
        onVaryCTAs={handleVaryCTAs}
      />
      {output && (
        <ScriptCard
          title={currentTitle}
          output={output}
          onCopy={handleCopy}
          onDuplicate={handleVaryHooks}
          onSave={handleSave}
          onPlanner={handleSendToPlanner}
        />
      )}
    </div>
  );
}
