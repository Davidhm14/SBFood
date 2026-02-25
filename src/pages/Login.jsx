import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onLogin }) {
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error al iniciar sesión');
        return;
      }

      login(data.user, data.token);
      onLogin?.();

    } catch (err) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 rounded-2xl p-10 w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl">🍽️</span>
          <h1 className="text-3xl font-bold text-white mt-3">SB Food</h1>
          <p className="text-slate-400 text-sm mt-1">Inicia sesión para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-slate-400 text-sm block mb-1">Correo electrónico</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="admin@sbfood.com"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="text-slate-400 text-sm block mb-1">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-500 text-red-300 rounded-lg px-4 py-3 text-sm">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-slate-600 text-xs text-center mt-6">
          SB Food POS v1.0.0
        </p>
      </div>
    </div>
  );
}
