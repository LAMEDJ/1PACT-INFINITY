/**
 * Client API 1PACT – appels vers le backend.
 * En développement : /api (proxy Vite vers localhost:3000).
 * En production : VITE_API_URL ou localhost:3000/api.
 */
const API_BASE = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:3000/api');

/** Base URL du serveur (sans /api) pour les médias uploadés */
export const UPLOAD_BASE = API_BASE.replace(/\/api\/?$/, '');

function getToken() {
  return localStorage.getItem('1pact_token');
}

function headers(includeAuth = true) {
  const h = { 'Content-Type': 'application/json' };
  if (includeAuth && getToken()) h.Authorization = `Bearer ${getToken()}`;
  return h;
}

async function request(method, path, body = null) {
  const url = `${API_BASE}${path}`;
  const opts = { method, headers: headers() };
  if (body && method !== 'GET') opts.body = JSON.stringify(body);
  let res;
  try {
    res = await fetch(url, opts);
  } catch (err) {
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error('Serveur inaccessible. Démarrez le backend (dossier backend : npm run dev).');
    }
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      setToken(null);
      try {
        window.dispatchEvent(new CustomEvent('1pact_unauthorized'));
      } catch (_) {}
    }
    const err = new Error(data.error || res.statusText || 'Erreur API');
    err.statusCode = res.status;
    throw err;
  }
  return data;
}

export const api = {
  auth: {
    login: (email, password, type) => request('POST', '/auth/login', { email, password, type }),
    registerUser: (email, password, name) => request('POST', '/auth/register/user', { email, password, name }),
    registerAssociation: (data) => request('POST', '/auth/register/association', data),
    me: () => request('GET', '/auth/me'),
    updateProfile: (data) => request('PATCH', '/auth/me', data),
    updateAccount: (data) => request('PATCH', '/auth/me/account', data),
    updatePreferences: (data) => request('PATCH', '/auth/me/preferences', data),
    deleteAccount: (password) => request('DELETE', '/auth/me', { password }),
  },
  associations: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request('GET', '/associations' + (q ? '?' + q : ''));
    },
    get: (id) => request('GET', `/associations/${id}`),
  },
  publications: {
    list: (params = {}) => {
      const p = { limit: params.limit || 50, ...params };
      const q = new URLSearchParams(p).toString();
      return request('GET', `/publications?${q}`);
    },
    create: (body) => request('POST', '/publications', body),
    update: (id, body) => request('PATCH', `/publications/${id}`, body),
    delete: (id) => request('DELETE', `/publications/${id}`),
    like: (id) => request('POST', `/publications/${id}/like`),
    comments: (id) => request('GET', `/publications/${id}/comments`),
    addComment: (id, text) => request('POST', `/publications/${id}/comments`, { text }),
  },
  conversations: {
    list: () => request('GET', '/conversations'),
    create: (other_user_id, other_association_id) => request('POST', '/conversations', { other_user_id: other_user_id || undefined, other_association_id: other_association_id || undefined }),
    messages: (id) => request('GET', `/conversations/${id}/messages`),
    sendMessage: (id, text) => request('POST', `/conversations/${id}/messages`, { text }),
  },
  notifications: {
    list: () => request('GET', '/notifications'),
    readAll: () => request('POST', '/notifications/read-all'),
  },
  propositions: {
    create: (body) => request('POST', '/propositions', body),
  },
  dashboard: {
    stats: () => request('GET', '/dashboard/stats'),
    publications: () => request('GET', '/dashboard/publications'),
    getPublication: (id) => request('GET', `/dashboard/publications/${id}`),
  },
  stripe: {
    createCheckout: () => request('POST', '/stripe/create-checkout-session'),
    portal: () => request('GET', '/stripe/portal'),
  },
  follows: {
    list: () => request('GET', '/follows'),
    follow: (associationId) => request('POST', `/follows/${associationId}`),
    unfollow: (associationId) => request('DELETE', `/follows/${associationId}`),
  },
  /** Quêtes géolocalisées (optionnel : si le backend expose une route /quests) */
  quests: {
    list: () => request('GET', '/quests'),
    get: (id) => request('GET', `/quests/${id}`),
  },
  upload: {
    /** Envoie un fichier (image ou vidéo), renvoie l'URL relative (ex. /uploads/xxx.jpg) */
    async file(file) {
      const form = new FormData();
      form.append('file', file);
      const opts = { method: 'POST', body: form };
      if (getToken()) opts.headers = { Authorization: `Bearer ${getToken()}` };
      const res = await fetch(`${API_BASE}/upload`, opts);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erreur upload');
      return data.url;
    },
  },
};

export function setToken(token) {
  if (token) localStorage.setItem('1pact_token', token);
  else localStorage.removeItem('1pact_token');
}

export { getToken };
