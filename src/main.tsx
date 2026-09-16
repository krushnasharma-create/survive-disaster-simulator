// src/main.tsx
// App entry point. Mounts React, sets up BrowserRouter, imports global styles.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';
import './styles/animations.css';
import './styles/themes/earthquake.css';
import './styles/themes/fire.css';
import './styles/themes/flood.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
