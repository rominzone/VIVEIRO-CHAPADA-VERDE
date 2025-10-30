import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Planner } from './pages/Planner';
import { Settings } from './pages/Settings';
import { Script, useScriptsStore } from './features/store/useScriptsStore';
import { useToast } from './components/Toast';

export default function App() {
  const { scripts, duplicateScript, removeScript } = useScriptsStore();
  const { pushToast } = useToast();
  const [currentPage, setCurrentPage] = useState<'home' | 'planner' | 'settings'>('home');
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  const handleNewScript = () => {
    setSelectedScript(null);
    setCurrentPage('home');
    pushToast('Novo roteiro pronto para preencher', 'info');
  };

  const handleDuplicate = (id: string) => {
    const duplicated = duplicateScript(id);
    if (duplicated) {
      setSelectedScript(duplicated);
      setCurrentPage('home');
      pushToast('Variação duplicada com sucesso', 'success');
    }
  };

  const handleDelete = (id: string) => {
    removeScript(id);
    if (selectedScript?.id === id) {
      setSelectedScript(null);
    }
    pushToast('Roteiro removido do acervo', 'info');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition dark:bg-slate-900 dark:text-slate-100">
      <Header onNewScript={handleNewScript} onNavigate={setCurrentPage} currentPage={currentPage} />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0">
        <Sidebar
          scripts={scripts}
          onSelect={(script) => {
            setSelectedScript(script);
            setCurrentPage('home');
          }}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
        <main className="flex-1 space-y-6 overflow-y-auto bg-slate-50 px-4 py-6 dark:bg-slate-900">
          {currentPage === 'home' && (
            <Home selectedScript={selectedScript} onClearSelection={() => setSelectedScript(null)} />
          )}
          {currentPage === 'planner' && <Planner />}
          {currentPage === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}
