import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Activation from './pages/Activation';
import Login      from './pages/Login';
import Tables from './pages/tables';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <span className="text-xl font-bold text-orange-500">SB Food</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">
            👤 {user?.name}
            <span className="ml-2 bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
              {user?.role}
            </span>
          </span>
          <button
            onClick={logout}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <main className="p-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">🪑 Mesas del restaurante</h2>
        <Tables onSelectTable={(table) => console.log('Mesa seleccionada:', table)} />
      </main>
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
