import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { TonProvider } from './providers/TonProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TonProvider>
        <App />
      </TonProvider>
    </BrowserRouter>
  </React.StrictMode>
);
