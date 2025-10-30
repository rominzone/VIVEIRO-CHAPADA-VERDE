import { useEffect, useState } from 'react';
import { useScriptsStore } from '../features/store/useScriptsStore';

const modes = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Escuro' },
  { id: 'system', label: 'Sistema' }
] as const;

export function ThemeToggle() {
  const { settings, updateSettings } = useScriptsStore();
  const [index, setIndex] = useState(() => modes.findIndex((mode) => mode.id === settings.theme));

  useEffect(() => {
    setIndex(modes.findIndex((mode) => mode.id === settings.theme));
  }, [settings.theme]);

  const next = () => {
    const newIndex = (index + 1) % modes.length;
    setIndex(newIndex);
    updateSettings({ theme: modes[newIndex].id });
  };

  return (
    <button
      onClick={next}
      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      aria-label={`Alterar tema. Atual: ${modes[index]?.label ?? 'Sistema'}`}
    >
      Tema: {modes[index]?.label ?? 'Sistema'}
    </button>
  );
}
