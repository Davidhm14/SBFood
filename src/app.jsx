import { useState, useEffect } from 'react';
import Activation from './pages/Activation';

// Placeholder del Dashboard hasta que lo construyamos
function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-orange-500 mb-8">
          🍽️ SB Food
        </h1>
        <div className="bg-slate-800 p-8 rounded-xl">
          <h2 className="text-2xl mb-4">Estado del sistema:</h2>
          <div className="space-y-2">
            <p>✅ API corriendo en localhost:4000</p>
            <p>✅ PostgreSQL conectado</p>
            <p>✅ Licencia verificada</p>
            <p>🚀 Listo para desarrollar módulos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [licensed, setLicensed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const status = await window.electronAPI.checkLicense();
        // Si está activo, salta la pantalla de activación
        if (status.status === 'active') {
          setLicensed(true);
        }
      } catch (e) {
        // Si no hay electronAPI (dev en browser), pasa directo
        setLicensed(false);
      } finally {
        setChecking(false);
      }
    }
    verify();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400 text-lg">Verificando licencia...</p>
      </div>
    );
  }

  if (!licensed) {
    return <Activation onActivated={() => setLicensed(true)} />;
  }

  return <Dashboard />;
}
