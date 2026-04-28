const isLocalViteDev =
  window.location.hostname === 'localhost' && window.location.port === '5173';

function normalizeUrl(value) {
  return value ? value.replace(/\/$/, '') : '';
}

export function getApiBaseUrl() {
  const envUrl = normalizeUrl(import.meta.env.VITE_API_BASE_URL);
  if (envUrl) return envUrl;

  if (isLocalViteDev) return 'http://localhost:5000/api';

  return `${window.location.origin}/api`;
}

export function getWebSocketUrl() {
  const envUrl = normalizeUrl(import.meta.env.VITE_WS_URL);
  if (envUrl) return envUrl;

  if (isLocalViteDev) return 'ws://localhost:5000';

  return window.location.protocol === 'https:'
    ? `wss://${window.location.host}`
    : `ws://${window.location.host}`;
}
