import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MarketplacePage } from './MarketplacePage';
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/800-italic.css';
import '@fontsource-variable/instrument-sans';
import '../index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MarketplacePage />
  </StrictMode>,
);
