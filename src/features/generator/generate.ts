import { HOOKS, BENEFITS, TWISTS, CTA_GROUPS, TIPS, DEFAULT_TRENDS } from './templates';
import { applyRules, CODE_DETAILS, DraftScript, GenerationContext } from './rules';
import type { DurationOption, Objective, ScriptOutput } from '../store/useScriptsStore';

export interface GenerateParams {
  briefing: string;
  niche: string;
  objective: Objective;
  duration: DurationOption;
  tone: string;
  trends: string[];
  activeCodes: Record<string, boolean>;
  forbiddenWords: string[];
}

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();

const createSeededRandom = (seed: string) => {
  let value = 0;
  for (let i = 0; i < seed.length; i += 1) {
    value = (value + seed.charCodeAt(i) * (i + 11)) % 2147483647;
  }
  if (value === 0) value = 1234567;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

const pickUnique = (pool: string[], amount: number, seed: string) => {
  const random = createSeededRandom(seed);
  const available = [...pool];
  const results: string[] = [];
  while (results.length < amount && available.length) {
    const index = Math.floor(random() * available.length);
    results.push(available.splice(index, 1)[0]);
  }
  return results;
};

const filterHooksByObjective = (objective: Objective) => {
  if (objective === 'Alcance') {
    return HOOKS.filter((hook) => hook.includes('?') || hook.toLowerCase().includes('viral'));
  }
  if (objective === 'Conexão') {
    return HOOKS.filter((hook) => hook.toLowerCase().includes('história') || hook.toLowerCase().includes('erro'));
  }
  return HOOKS.filter((hook) => hook.toLowerCase().includes('cta') || hook.toLowerCase().includes('converte'));
};

const buildDevelopment = (briefing: string, niche: string, objective: Objective, seed: string) => {
  const cleanBriefing = normalize(briefing || '');
  const random = createSeededRandom(`${seed}-${cleanBriefing}`);
  const keyword = cleanBriefing.split(' ').filter(Boolean).slice(0, 3).join(' ');
  const benefit = BENEFITS[Math.floor(random() * BENEFITS.length)];
  const bullets: string[] = [
    `Entregue ${keyword || 'resultado'} em ${objective === 'Conversão' ? 'poucos passos' : 'ritmo constante'}: ${benefit}`,
    `Passo prático: ${cleanBriefing ? cleanBriefing.slice(0, 80) : 'apresente o método em três etapas rápidas'}`,
    `Prova rápida: mostre aplicação real no nicho ${niche || 'principal'}`
  ];
  if (objective === 'Conexão') {
    bullets.push('História flash: cite cliente ou bastidor que aprendeu com o erro');
  }
  return bullets.slice(0, objective === 'Conversão' ? 3 : 4);
};

const ensureWordLimit = (texts: string[], maxWords: number) =>
  texts.map((text) => text.split(' ').slice(0, maxWords).join(' '));

export function generateScript(params: GenerateParams): ScriptOutput {
  const {
    briefing,
    niche,
    objective,
    duration,
    tone,
    trends,
    activeCodes,
    forbiddenWords
  } = params;

  const seed = `${briefing}-${niche}-${objective}-${trends.join('-')}`;
  const hookPool = filterHooksByObjective(objective);
  const selectedHooks = pickUnique(hookPool.length >= 3 ? hookPool : HOOKS, 3, `${seed}-hooks`);
  const hooks = ensureWordLimit(selectedHooks, 12);

  const devBullets = ensureWordLimit(buildDevelopment(briefing, niche, objective, seed), 16);

  const twistPoolSeed = `${seed}-twist`;
  const twist = TWISTS[Math.floor(createSeededRandom(twistPoolSeed)() * TWISTS.length)];

  const tipSeed = `${seed}-tip`;
  const tip = TIPS[Math.floor(createSeededRandom(tipSeed)() * TIPS.length)];

  const hasTrend = trends.length > 0;
  const allTrends = hasTrend ? trends : DEFAULT_TRENDS.slice(0, 1);

  const softPool = [...CTA_GROUPS.follow, ...CTA_GROUPS.save];
  const softCTA = softPool[Math.floor(createSeededRandom(`${seed}-soft`)() * softPool.length)];
  const hardCTA = CTA_GROUPS.action[Math.floor(createSeededRandom(`${seed}-hard`)() * CTA_GROUPS.action.length)];

  const draft: DraftScript = {
    title: '',
    hooks,
    devBullets,
    twist: hasTrend ? `${twist} com ${allTrends[0]}` : twist,
    ctas: [softCTA, hardCTA],
    tip,
    microStory: undefined,
    commentCTA: undefined,
    meta: undefined
  };

  const context: GenerationContext = {
    briefing: normalize(briefing),
    niche: niche || 'Conteúdo',
    objective,
    duration,
    tone,
    trends: allTrends,
    activeCodes,
    forbiddenWords
  };

  const ruled = applyRules(draft, context);

  const uniqueHooks = Array.from(new Set(ruled.hooks.filter(Boolean)));
  while (uniqueHooks.length < 3) {
    uniqueHooks.push(HOOKS[(uniqueHooks.length * 7) % HOOKS.length]);
  }

  return {
    title: ruled.title || CODE_DETAILS[0]?.label || 'Roteiro Viral',
    hooks: ensureWordLimit(uniqueHooks, 12),
    devBullets: ruled.devBullets.filter(Boolean).map(normalize).slice(0, 4),
    twist: normalize(ruled.twist),
    ctas: ruled.ctas.slice(0, 2).map(normalize),
    tip: normalize(ruled.tip),
    commentCTA: ruled.commentCTA,
    meta: ruled.meta
  };
}
