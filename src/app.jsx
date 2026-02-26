import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Activation  from './pages/Activation';
import Login       from './pages/Login';
import Tables      from './pages/tables';
import OrderPanel  from './pages/OrderPanel';
import CashPage    from './pages/CashPage';
import TicketsPage from './pages/TicketsPage';  // ← nuevo

const ADMIN_TABS = [
  { id: 'tables',  label: '🪑 Mesas'   },
  { id: 'tickets', label: '🧾 Tickets' },
  { id: 'cash',    label: '💰 Caja'    },
];

const WAITER_TABS = [
  { id: 'tables', label: '🪑 Mesas' },
];

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab]         = useState('tables');
  const [selectedTable, setSelectedTable] = useState(null);
  const [refreshTables, setRefreshTables] = useState(0);

  const tabs = user?.role === 'admin' ? ADMIN_TABS : WAITER_TABS;

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <span className="text-xl font-bold text-orange-500">SB Food</span>
          </div>

          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
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
        {activeTab === 'tables' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">🪑 Mesas del restaurante</h2>
            <Tables key={refreshTables} onSelectTable={setSelectedTable} />
          </>
        )}

        {activeTab === 'tickets' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">🧾 Tickets pendientes</h2>
            <TicketsPage />
          </>
        )}

        {activeTab === 'cash' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">💰 Caja</h2>
            <CashPage />
          </>
        )}
      </main>

      {/* Panel de comanda — solo visible en tab mesas */}
      {selectedTable && activeTab === 'tables' && (
        <OrderPanel
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onOrderUpdate={() => setRefreshTables(r => r + 1)}
          onOrderClosed={() => {
            setRefreshTables(r => r + 1);
            setSelectedTable(null);
          }}
        />
      )}
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
