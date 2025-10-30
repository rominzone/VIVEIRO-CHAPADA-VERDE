import { describe, expect, it } from 'vitest';
import { generateScript } from './generate';
import { CODE_DETAILS } from './rules';

describe('generateScript', () => {
  const baseParams = {
    briefing: 'Aumentar produtividade das mudas de café em 30 dias com checklist visual',
    niche: 'Agronegócio',
    objective: 'Alcance' as const,
    duration: 30 as const,
    tone: 'Conversacional',
    trends: ['Trend do checklist aparecendo na tela'],
    activeCodes: CODE_DETAILS.reduce<Record<string, boolean>>((acc, code) => {
      acc[code.id] = true;
      return acc;
    }, {}),
    forbiddenWords: ['impossível']
  };

  it('gera exatamente três ganchos e dois CTAs', () => {
    const script = generateScript(baseParams);
    expect(script.hooks).toHaveLength(3);
    expect(script.ctas).toHaveLength(2);
  });

  it('remove palavras proibidas do resultado', () => {
    const script = generateScript({ ...baseParams, forbiddenWords: ['checklist'] });
    const includesForbidden = [
      ...script.hooks,
      ...script.devBullets,
      script.twist,
      ...script.ctas,
      script.tip
    ].some((text) => text.toLowerCase().includes('checklist'));
    expect(includesForbidden).toBe(false);
  });

  it('força CTA de ação direta quando objetivo é conversão', () => {
    const script = generateScript({ ...baseParams, objective: 'Conversão' });
    expect(script.ctas[1]).toMatch(/bio/i);
  });

  it('menciona trend no gancho ou desenvolvimento quando selecionada', () => {
    const script = generateScript(baseParams);
    const mention = script.hooks.concat(script.devBullets).some((text) =>
      text.toLowerCase().includes('trend do checklist aparecendo na tela'.split(' ')[1].toLowerCase())
    );
    expect(mention).toBe(true);
  });
});
