import { useAuth } from '../context/AuthContext';

export function useApi() {
  const { logout } = useAuth();
  const BASE = 'http://localhost:4000/api';

  async function request(endpoint, options = {}) {
    // Lee el token fresco en cada llamada
    const token = localStorage.getItem('sbfood_token');

    const res = await fetch(`${BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (res.status === 401 || res.status === 403) {
      logout();
      return null;
    }

    return res.json();
  }

  return {
    get:    (endpoint)       => request(endpoint),
    post:   (endpoint, body) => request(endpoint, { method: 'POST',  body: JSON.stringify(body) }),
    patch:  (endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint)       => request(endpoint, { method: 'DELETE' }),
  };
}
