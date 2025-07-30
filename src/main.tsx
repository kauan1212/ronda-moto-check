
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Adiciona um Error Boundary global
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro no aplicativo:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h2>Algo deu errado!</h2>
          <p>Por favor, recarregue a página ou tente novamente mais tarde.</p>
          <button onClick={() => window.location.reload()}>Recarregar Página</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// PWA Registration and optimizations
const registerSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Nova versão disponível! Por favor, atualize a página.');
            }
          });
        }
      });
    } catch (error) {
      console.error('Falha ao registrar Service Worker: ', error);
    }
  }
};

// Initialize app
const initApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) throw new Error('Elemento raiz não encontrado');
    
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    // Registrar service worker após o carregamento do app
    registerSW();
  } catch (error) {
    console.error('Erro ao inicializar o aplicativo:', error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif;">
          <h2>Erro ao carregar o aplicativo</h2>
          <p>${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
          <button onclick="window.location.reload()">Tentar novamente</button>
        </div>
      `;
    }
  }
};

// Iniciar o aplicativo quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
