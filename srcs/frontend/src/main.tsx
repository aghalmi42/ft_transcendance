import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

function mountApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) return false;

  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    return true;
  } catch (err) {
    console.error('[Mount Error]', err);
    return false;
  }
}

// Immediate mount attempt
if (!mountApp()) {
  // If DOM not ready yet, wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!mountApp()) {
        const interval = setInterval(() => {
          if (mountApp()) clearInterval(interval);
        }, 50);
      }
    });
  } else {
    // Retry polling until #root is present in the DOM
    const interval = setInterval(() => {
      if (mountApp()) clearInterval(interval);
    }, 50);
  }
}
