import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onNewScript: () => void;
  onNavigate: (page: 'home' | 'planner' | 'settings') => void;
  currentPage: 'home' | 'planner' | 'settings';
}

export function Header({ onNewScript, onNavigate, currentPage }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-primary">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">CV</span>
            Chat Viral Clone
          </span>
          <span className="hidden text-xs text-slate-500 dark:text-slate-400 md:block">
            Gerador offline com os 19 Códigos
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              currentPage === 'home'
                ? 'bg-primary text-primary-foreground'
                : 'bg-white text-slate-600 shadow-sm hover:text-primary dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            Gerador
          </button>
          <button
            type="button"
            onClick={() => onNavigate('planner')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              currentPage === 'planner'
                ? 'bg-primary text-primary-foreground'
                : 'bg-white text-slate-600 shadow-sm hover:text-primary dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            Planner
          </button>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              currentPage === 'settings'
                ? 'bg-primary text-primary-foreground'
                : 'bg-white text-slate-600 shadow-sm hover:text-primary dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            Configurações
          </button>
          <button type="button" onClick={onNewScript} className="btn hidden md:inline-flex">Novo Roteiro</button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
