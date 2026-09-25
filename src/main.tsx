import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
// Brand fonts, self-hosted (no render-blocking request to Google Fonts).
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/800-italic.css';
import '@fontsource-variable/instrument-sans';
import './index.css';

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

const container = document.getElementById('root')!;
// Prerendered builds ship HTML inside #root — hydrate it; dev renders fresh.
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);
