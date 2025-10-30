import type { DurationOption, Objective } from '../store/useScriptsStore';

export interface GenerationContext {
  briefing: string;
  niche: string;
  objective: Objective;
  duration: DurationOption;
  tone: string;
  trends: string[];
  activeCodes: Record<string, boolean>;
  forbiddenWords: string[];
}

export interface DraftScript {
  title: string;
  hooks: string[];
  devBullets: string[];
  twist: string;
  ctas: string[];
  tip: string;
  microStory?: string;
  commentCTA?: string;
  meta?: {
    platformVariations?: { platform: string; hook: string }[];
    plannerSuggestion?: string;
  };
}

export interface CodeRule {
  id: string;
  label: string;
  description: string;
  apply: (draft: DraftScript, context: GenerationContext) => void;
}

const simplifySentence = (text: string) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  const words = clean.split(' ');
  if (words.length <= 14) return clean;
  return words.slice(0, 14).join(' ');
};

const ensureQuestion = (text: string) => {
  if (text.includes('?')) return text;
  return `${text}?`;
};

const emphasise = (text: string) => {
  if (text.includes('agora')) return text;
  return `${text} agora`;
};

const removeForbiddenWords = (text: string, forbidden: string[]) => {
  let result = text;
  forbidden.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, '').replace(/\s{2,}/g, ' ').trim();
  });
  return result;
};

const addTone = (text: string, tone: string) => {
  if (!tone) return text;
  if (text.toLowerCase().includes(tone.toLowerCase())) return text;
  return `${text} — ${tone.toLowerCase()}`;
};

const timelineLabels: Record<DurationOption, number[]> = {
  20: [3, 15, 5, 4],
  30: [3, 20, 8, 5],
  40: [3, 22, 9, 6]
};

export const CODE_RULES: CodeRule[] = [
  {
    id: 'humano',
    label: 'O Humano',
    description: 'Linguagem coloquial, frases curtas e diretas.',
    apply: (draft) => {
      draft.hooks = draft.hooks.map(simplifySentence);
      draft.devBullets = draft.devBullets.map(simplifySentence);
      draft.twist = simplifySentence(draft.twist);
    }
  },
  {
    id: 'algoritmo',
    label: 'O Algoritmo',
    description: 'Maximiza retenção com ganchos fortes e sem enrolação.',
    apply: (draft) => {
      draft.hooks = draft.hooks.map((hook, index) => (index === 0 ? ensureQuestion(hook) : hook));
      if (draft.devBullets.length) {
        draft.devBullets[0] = simplifySentence(`Promessa: ${draft.devBullets[0]}`);
      }
    }
  },
  {
    id: 'hierarquias',
    label: 'Hierarquias Virais',
    description: 'Prioriza hooks e CTAs com peso emocional.',
    apply: (draft) => {
      draft.ctas = draft.ctas.map((cta, index) => (index === 0 ? emphasise(cta) : emphasise(cta)));
    }
  },
  {
    id: 'criatividade',
    label: 'Criatividade Sintética',
    description: 'Conecta trend ao nicho com narrativa aplicada.',
    apply: (draft, context) => {
      if (context.trends.length) {
        draft.devBullets = draft.devBullets.map((bullet, index) =>
          index === 0 ? `${context.trends[0]} adaptada ao nicho: ${bullet}` : bullet
        );
      }
    }
  },
  {
    id: 'alinhamento',
    label: 'Alinhamento',
    description: 'Ajusta mensagem conforme objetivo do funil.',
    apply: (draft, context) => {
      if (context.objective === 'Alcance') {
        draft.hooks = draft.hooks.map((hook) => `Curiosidade: ${hook}`);
      }
      if (context.objective === 'Conexão') {
        draft.microStory = 'Micro-história real: lembre de contar o bastidor em uma frase.';
      }
      if (context.objective === 'Conversão') {
        draft.devBullets = draft.devBullets.map((bullet, index) =>
          index === 0 ? `Benefício direto: ${bullet}` : bullet
        );
        draft.ctas = draft.ctas.map((cta, index) => (index === 1 ? `${cta} (ação direta)` : cta));
      }
    }
  },
  {
    id: 'molho',
    label: 'O Molho',
    description: 'Aplica tom de voz e remove palavras proibidas.',
    apply: (draft, context) => {
      draft.hooks = draft.hooks.map((hook) => removeForbiddenWords(hook, context.forbiddenWords));
      draft.devBullets = draft.devBullets.map((bullet) => removeForbiddenWords(bullet, context.forbiddenWords));
      draft.twist = removeForbiddenWords(draft.twist, context.forbiddenWords);
      draft.ctas = draft.ctas.map((cta) => removeForbiddenWords(cta, context.forbiddenWords));
      draft.tip = removeForbiddenWords(draft.tip, context.forbiddenWords);
      draft.tip = addTone(draft.tip, context.tone);
    }
  },
  {
    id: 'timing',
    label: 'Timing',
    description: 'Insere a trend em gancho ou desenvolvimento quando houver.',
    apply: (draft, context) => {
      if (!context.trends.length) return;
      const mention = context.trends[0];
      draft.hooks = draft.hooks.map((hook, index) => (index === 0 ? `${hook} usando ${mention}` : hook));
    }
  },
  {
    id: 'titulo',
    label: 'Título',
    description: 'Gera título interno específico, curioso e urgente.',
    apply: (draft, context) => {
      const urgency = context.objective === 'Conversão' ? 'agora' : 'hoje';
      draft.title = `${context.niche || 'Conteúdo'}: ${draft.devBullets[0]} — faça isso ${urgency}`;
    }
  },
  {
    id: 'gancho',
    label: 'Gancho Viral',
    description: 'Garante três variações curtas sem cumprimentos genéricos.',
    apply: (draft) => {
      draft.hooks = draft.hooks.map((hook) => hook.replace(/olá|boa tarde|bom dia/gi, '').trim());
    }
  },
  {
    id: 'beneficio',
    label: 'Benefício',
    description: 'Coloca benefício explícito nos primeiros bullets.',
    apply: (draft) => {
      if (draft.devBullets.length) {
        draft.devBullets[0] = draft.devBullets[0].startsWith('Benefício')
          ? draft.devBullets[0]
          : `Benefício rápido: ${draft.devBullets[0]}`;
      }
    }
  },
  {
    id: 'bio',
    label: 'Bio',
    description: 'CTA duro remete ao link da bio para conversão.',
    apply: (draft, context) => {
      if (context.objective === 'Conversão' && draft.ctas.length > 1 && !draft.ctas[1].includes('bio')) {
        draft.ctas[1] = `${draft.ctas[1]} pelo link da bio`;
      }
    }
  },
  {
    id: 'tempo',
    label: 'Tempo',
    description: 'Distribui tempo sugerido para cada etapa.',
    apply: (draft, context) => {
      const [gancho, desenvolvimento, virada, cta] = timelineLabels[context.duration];
      draft.meta = {
        ...draft.meta,
        plannerSuggestion: `Gancho ${gancho}s • Desenvolvimento ${desenvolvimento}s • Virada ${virada}s • CTA ${cta}s`
      };
    }
  },
  {
    id: 'mostre',
    label: 'Mostre!',
    description: 'Tip reforça ação visual concreta.',
    apply: (draft) => {
      if (!draft.tip.toLowerCase().includes('mostre')) {
        draft.tip = `Mostre em cena: ${draft.tip}`;
      }
    }
  },
  {
    id: 'cta',
    label: 'CTA',
    description: 'Sempre dois CTAs complementares.',
    apply: (draft) => {
      if (draft.ctas.length < 2) {
        draft.ctas = [...draft.ctas, 'Compartilha com alguém agora'];
      }
    }
  },
  {
    id: 'porta',
    label: 'Porta na Cara',
    description: 'Cria micro-loop prometendo revelação na virada.',
    apply: (draft) => {
      draft.hooks = draft.hooks.map((hook, index) =>
        index === 0 ? `${hook} e segura porque no final tem o erro #1` : hook
      );
      draft.twist = `Erro #1 revelado: ${draft.twist}`;
    }
  },
  {
    id: 'hora',
    label: 'A Hora',
    description: 'Sugere horários padrões conforme plataforma padrão.',
    apply: (draft, context) => {
      const platform = context.niche.toLowerCase().includes('tik') ? 'TikTok' : 'Reels';
      const suggestion = platform === 'TikTok' ? '12h00 ou 20h30' : '11h30 ou 19h00';
      draft.meta = {
        ...draft.meta,
        plannerSuggestion: `${draft.meta?.plannerSuggestion ?? ''} • Publique às ${suggestion}`.trim()
      };
    }
  },
  {
    id: 'comentarios',
    label: 'Comentários',
    description: 'CTA extra para incentivar comentários.',
    apply: (draft) => {
      draft.commentCTA = draft.commentCTA ?? 'Comenta qual parte fez mais sentido pra você';
    }
  },
  {
    id: 'tres',
    label: '3 em 1',
    description: 'Sugere variações para Reels, TikTok e Shorts.',
    apply: (draft) => {
      const baseHook = draft.hooks[0] ?? 'Gancho pronto';
      draft.meta = {
        ...draft.meta,
        platformVariations: [
          { platform: 'Reels', hook: baseHook },
          { platform: 'TikTok', hook: `${baseHook} em 15s` },
          { platform: 'Shorts', hook: `${baseHook} direto ao ponto` }
        ]
      };
    }
  },
  {
    id: 'constancia',
    label: 'Constância',
    description: 'Lembra da frequência mínima semanal.',
    apply: (draft) => {
      draft.devBullets = draft.devBullets.map((bullet, index) =>
        index === draft.devBullets.length - 1
          ? `${bullet} • Produza 3 vídeos nesta semana para consolidar` : bullet
      );
    }
  }
];

export const CODE_DETAILS = CODE_RULES.map(({ id, label, description }) => ({ id, label, description }));

export function applyRules(draft: DraftScript, context: GenerationContext): DraftScript {
  CODE_RULES.forEach((rule) => {
    if (context.activeCodes[rule.id] ?? true) {
      rule.apply(draft, context);
    }
  });
  return draft;
}
