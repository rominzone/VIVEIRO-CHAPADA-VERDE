import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { ScriptsStoreProvider } from './features/store/useScriptsStore';
import { ToastProvider } from './components/Toast';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ScriptsStoreProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ScriptsStoreProvider>
  </React.StrictMode>
);
