import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { DEFAULT_TRENDS } from '../generator/templates';

export type Objective = 'Alcance' | 'Conexão' | 'Conversão';
export type DurationOption = 20 | 30 | 40;

export interface ScriptOutput {
  title: string;
  hooks: string[];
  devBullets: string[];
  twist: string;
  ctas: string[];
  tip: string;
  commentCTA?: string;
  meta?: {
    plannerSuggestion?: string;
    platformVariations?: { platform: string; hook: string }[];
  };
}

export interface Script {
  id: string;
  title: string;
  briefing: string;
  niche: string;
  objective: Objective;
  duration: DurationOption;
  tone: string;
  trends: string[];
  codesApplied: string[];
  output: ScriptOutput;
  status: 'Rascunho' | 'Aprovado' | 'Agendado' | 'Publicado';
  createdAt: string;
  updatedAt: string;
}

export interface PlannerEntry {
  id: string;
  scriptId: string;
  dateISO: string;
  platform: string;
  caption: string;
  hashtags: string[];
  status: 'Rascunho' | 'Aprovado' | 'Agendado' | 'Publicado';
  suggestedTimes?: string[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultNiche: string;
  defaultObjective: Objective;
  defaultDuration: DurationOption;
  trends: string[];
  forbiddenWords: string[];
  defaultTone: string;
  defaultPlatform: string;
}

export interface ScriptsStoreValue {
  scripts: Script[];
  planner: PlannerEntry[];
  settings: AppSettings;
  addScript: (script: Script) => void;
  updateScript: (id: string, updater: (script: Script) => Script) => void;
  removeScript: (id: string) => void;
  duplicateScript: (id: string) => Script | undefined;
  upsertPlanner: (entry: PlannerEntry) => void;
  removePlanner: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  createEmptyScript: () => Script;
}

const SCRIPTS_KEY = 'cvco_scripts';
const PLANNER_KEY = 'cvco_planner';
const SETTINGS_KEY = 'cvco_settings';

const defaultSettings: AppSettings = {
  theme: 'system',
  defaultNiche: '',
  defaultObjective: 'Alcance',
  defaultDuration: 30,
  trends: [...DEFAULT_TRENDS],
  forbiddenWords: ['impossível', 'garantia'],
  defaultTone: 'Conversacional e direto',
  defaultPlatform: 'Reels'
};

const ScriptsStoreContext = createContext<ScriptsStoreValue | undefined>(undefined);

function readStorage<T>(key: string): T | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch (error) {
    console.warn('Erro ao ler localStorage', error);
    return undefined;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Erro ao salvar localStorage', error);
  }
}

function hydrateSettings(): AppSettings {
  const stored = readStorage<AppSettings>(SETTINGS_KEY);
  if (!stored) return defaultSettings;
  return {
    ...defaultSettings,
    ...stored,
    trends: stored.trends?.length ? stored.trends : defaultSettings.trends,
    forbiddenWords: stored.forbiddenWords ?? defaultSettings.forbiddenWords
  };
}

export const ScriptsStoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [scripts, setScripts] = useState<Script[]>(() => readStorage<Script[]>(SCRIPTS_KEY) ?? []);
  const [planner, setPlanner] = useState<PlannerEntry[]>(() => readStorage<PlannerEntry[]>(PLANNER_KEY) ?? []);
  const [settings, setSettings] = useState<AppSettings>(() => hydrateSettings());

  useEffect(() => {
    writeStorage(SCRIPTS_KEY, scripts);
  }, [scripts]);

  useEffect(() => {
    writeStorage(PLANNER_KEY, planner);
  }, [planner]);

  useEffect(() => {
    writeStorage(SETTINGS_KEY, settings);
  }, [settings]);

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const root = document.documentElement;
    const theme = settings.theme === 'system' ? (prefersDark ? 'dark' : 'light') : settings.theme;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const value = useMemo<ScriptsStoreValue>(() => ({
    scripts,
    planner,
    settings,
    addScript: (script) => {
      setScripts((current) => [script, ...current]);
    },
    updateScript: (id, updater) => {
      setScripts((current) =>
        current.map((script) => (script.id === id ? { ...updater(script), updatedAt: new Date().toISOString() } : script))
      );
    },
    removeScript: (id) => {
      setScripts((current) => current.filter((script) => script.id !== id));
      setPlanner((current) => current.filter((entry) => entry.scriptId !== id));
    },
    duplicateScript: (id) => {
      const original = scripts.find((script) => script.id === id);
      if (!original) return undefined;
      const copy: Script = {
        ...original,
        id: nanoid(),
        title: `${original.title} (variação)` ,
        status: 'Rascunho',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setScripts((current) => [copy, ...current]);
      return copy;
    },
    upsertPlanner: (entry) => {
      setPlanner((current) => {
        const exists = current.some((item) => item.id === entry.id);
        if (exists) {
          return current.map((item) => (item.id === entry.id ? entry : item));
        }
        return [...current, entry];
      });
    },
    removePlanner: (id) => {
      setPlanner((current) => current.filter((item) => item.id !== id));
    },
    updateSettings: (next) => {
      setSettings((current) => ({ ...current, ...next }));
    },
    createEmptyScript: () => ({
      id: nanoid(),
      title: 'Roteiro viral inédito',
      briefing: '',
      niche: settings.defaultNiche,
      objective: settings.defaultObjective,
      duration: settings.defaultDuration,
      tone: settings.defaultTone,
      trends: [],
      codesApplied: [],
      output: {
        title: '',
        hooks: [],
        devBullets: [],
        twist: '',
        ctas: [],
        tip: ''
      },
      status: 'Rascunho',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }), [planner, scripts, settings]);

  return <ScriptsStoreContext.Provider value={value}>{children}</ScriptsStoreContext.Provider>;
};

export function useScriptsStore() {
  const context = useContext(ScriptsStoreContext);
  if (!context) {
    throw new Error('useScriptsStore deve ser usado dentro de ScriptsStoreProvider');
  }
  return context;
}

export const plannerDefaultTimes: Record<string, string[]> = {
  Reels: ['11:30', '19:00'],
  TikTok: ['12:00', '20:30'],
  Shorts: ['09:00', '18:45'],
  Kwai: ['10:15', '21:00']
};
