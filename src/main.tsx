import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { TonProvider } from './providers/TonProvider';
import './index.css';

interface TelegramThemeParams {
  bg_color?: string;
  secondary_bg_color?: string;
  text_color?: string;
  hint_color?: string;
  button_color?: string;
  button_text_color?: string;
}

function applyTelegramTheme(params: TelegramThemeParams) {
  const root = document.documentElement;
  if (params.bg_color) root.style.setProperty('--bg-primary', params.bg_color);
  if (params.secondary_bg_color) {
    root.style.setProperty('--bg-card', params.secondary_bg_color);
    root.style.setProperty('--bg-card-hover', params.secondary_bg_color);
    root.style.setProperty('--bg-input', params.secondary_bg_color);
  }
  if (params.text_color) root.style.setProperty('--text-primary', params.text_color);
  if (params.hint_color) {
    root.style.setProperty('--text-secondary', params.hint_color);
    root.style.setProperty('--text-muted', params.hint_color);
  }
}

try {
  const twa = (window as any).Telegram?.WebApp;
  if (twa) {
    twa.ready();
    twa.expand();
    applyTelegramTheme(twa.themeParams ?? {});
    twa.onEvent('themeChanged', () => applyTelegramTheme(twa.themeParams ?? {}));
  }
} catch (e) {
  console.warn('Telegram WebApp init failed:', e);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TonProvider>
        <App />
      </TonProvider>
    </BrowserRouter>
  </React.StrictMode>
);
