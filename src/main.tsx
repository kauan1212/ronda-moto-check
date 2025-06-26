
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// PWA Registration and optimizations
const registerSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, could show update notification
              console.log('New content available, please refresh.');
            }
          });
        }
      });
    } catch (error) {
      console.log('SW registration failed: ', error);
    }
  }
};

// Initialize app
const initApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error('Failed to find the root element');
  
  const root = createRoot(rootElement);
  root.render(<App />);
  
  // Register service worker after app loads
  registerSW();
  
  // Performance monitoring
  if (typeof window !== 'undefined') {
    // Report web vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    }).catch(() => {
      // web-vitals not available, continue without metrics
    });
  }
};

// Start the app
initApp();
