import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './assets/styles/index.css';

// ── Prevent browser scroll restoration on every page entry ──────────────────
// Covers both hard reloads (inline block below) and back/forward bfcache
// restores (pageshow listener).  bfcache is important: when the user navigates
// away and comes back, JS does NOT re-evaluate, so the inline block below won't
// fire — only the pageshow listener catches that case.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
if (window.location.hash) {
  window.history.replaceState(
    null,
    '',
    window.location.pathname + window.location.search
  );
}

window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    // bfcache restore — React state is frozen so we just reset the scroll
    window.scrollTo(0, 0);
    if (window.location.hash) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
