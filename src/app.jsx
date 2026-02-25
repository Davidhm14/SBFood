import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Activation from './pages/Activation';
import Login      from './pages/Login';

function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-orange-500">🍽️ SB Food</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">👤 {user?.name} — <span className="text-orange-400">{user?.role}</span></span>
            <button onClick={logout} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm">
              Cerrar sesión
            </button>
          </div>
        </div>
        <div className="bg-slate-800 p-8 rounded-xl">
          <h2 className="text-2xl mb-4">Estado del sistema:</h2>
          <div className="space-y-2">
            <p>✅ API corriendo en localhost:4000</p>
            <p>✅ PostgreSQL conectado</p>
            <p>✅ Licencia verificada</p>
            <p>✅ Usuario autenticado: {user?.name}</p>
            <p>🚀 Listo para desarrollar módulos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuth } = useAuth();
  const [licensed, setLicensed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const status = await window.electronAPI.checkLicense();
        if (status.status === 'active') setLicensed(true);
      } catch {
        setLicensed(false);
      } finally {
        setChecking(false);
      }
    }
    verify();
  }, []);

  if (checking) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <p className="text-slate-400 text-lg">Verificando licencia...</p>
    </div>
  );

  if (!licensed) return <Activation onActivated={() => setLicensed(true)} />;
  if (!isAuth)   return <Login onLogin={() => {}} />;
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
