import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ScriptsStoreProvider, useScriptsStore } from './useScriptsStore';

const createMockWindow = () => {
  const storage: Record<string, string> = {};
  return {
    localStorage: {
      getItem: vi.fn((key: string) => storage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(storage).forEach((key) => delete storage[key]);
      })
    },
    matchMedia: vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    })
  } as unknown as Window;
};

describe('useScriptsStore localStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', createMockWindow());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('salva e recupera script e agendamento', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ScriptsStoreProvider>{children}</ScriptsStoreProvider>
    );
    const { result } = renderHook(() => useScriptsStore(), { wrapper });
    act(() => {
      const base = result.current.createEmptyScript();
      result.current.addScript({
        ...base,
        title: 'Teste Persistência',
        briefing: 'Briefing persistência',
        output: {
          title: 'Persistência',
          hooks: ['Hook 1', 'Hook 2', 'Hook 3'],
          devBullets: ['Dev 1', 'Dev 2'],
          twist: 'Twist persistência',
          ctas: ['CTA 1', 'CTA 2'],
          tip: 'Tip persistência'
        }
      });
      result.current.upsertPlanner({
        id: 'planner-1',
        scriptId: base.id,
        dateISO: '2024-01-01',
        platform: 'Reels',
        caption: 'Legenda teste',
        hashtags: ['#teste'],
        status: 'Rascunho'
      });
    });

    const savedScripts = JSON.parse(window.localStorage.getItem('cvco_scripts') ?? '[]');
    const savedPlanner = JSON.parse(window.localStorage.getItem('cvco_planner') ?? '[]');
    expect(savedScripts).toHaveLength(1);
    expect(savedPlanner).toHaveLength(1);
  });
});
