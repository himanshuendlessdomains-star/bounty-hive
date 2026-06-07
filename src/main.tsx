import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { TonProvider } from './providers/TonProvider';
import './index.css';

// ─── Telegram detection ───────────────────────────────────────────────────────
// The telegram-web-app.js script always sets window.Telegram.WebApp, but only
// populates initDataUnsafe.user (and initData) when running inside a real
// Telegram WebView. In a regular browser both are absent/empty.

const twa = (window as any).Telegram?.WebApp;
const isTelegram = !!(twa?.initDataUnsafe?.user || twa?.initData);

// ─── Theme ────────────────────────────────────────────────────────────────────

interface TelegramThemeParams {
  bg_color?: string;
  secondary_bg_color?: string;
  text_color?: string;
  hint_color?: string;
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

if (isTelegram && twa) {
  twa.ready();
  twa.expand();
  applyTelegramTheme(twa.themeParams ?? {});
  twa.onEvent('themeChanged', () => applyTelegramTheme(twa.themeParams ?? {}));
}

// ─── Not-in-Telegram screen ───────────────────────────────────────────────────
// Uses inline styles only — not Tailwind — so it renders correctly regardless
// of whether the CSS bundle has loaded.

const BOT_URL = import.meta.env.VITE_TELEGRAM_BOT_URL ?? 'https://t.me/bountyhive24_bot/bountyhive24';

function NotInTelegramScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0f0f0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✈️</div>
      <h1
        style={{
          color: '#ffffff',
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
        }}
      >
        Open in Telegram
      </h1>
      <p
        style={{
          color: '#a1a1aa',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          marginBottom: '2rem',
          maxWidth: '280px',
        }}
      >
        BountyHive is a Telegram Mini App. It can't run in a regular browser —
        please open it through the Telegram bot.
      </p>
      <a
        href={BOT_URL}
        style={{
          backgroundColor: '#229ED9',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '0.875rem',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Open BountyHive in Telegram
      </a>
    </div>
  );
}

// ─── Mount ────────────────────────────────────────────────────────────────────
// Render the gate BEFORE initialising TonConnect so a TonConnect crash can
// never produce a blank screen for non-Telegram users.

const root = document.getElementById('root')!;

if (!isTelegram) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <NotInTelegramScreen />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <TonProvider>
          <App />
        </TonProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
