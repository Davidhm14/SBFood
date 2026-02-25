import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

const STATUS_CONFIG = {
  free:     { label: 'Disponible', bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  occupied: { label: 'Ocupada',    bg: 'bg-red-500/20',     border: 'border-red-500',     text: 'text-red-400',     dot: 'bg-red-500'    },
  pending:  { label: 'Pendiente',  bg: 'bg-yellow-500/20',  border: 'border-yellow-500',  text: 'text-yellow-400',  dot: 'bg-yellow-500' },
};

export default function Tables({ onSelectTable }) {
  const api = useApi();
  const [tables, setTables]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => { fetchTables(); }, []);

  async function fetchTables() {
    setLoading(true);
    const data = await api.get('/tables');
    if (Array.isArray(data)) setTables(data);
    else setTables([]);
    setLoading(false);
  }

  async function changeStatus(tableId, newStatus) {
    await api.patch(`/tables/${tableId}/status`, { status: newStatus });
    fetchTables();
  }

  const filtered = filter === 'all' ? tables : tables.filter(t => t.status === filter);

  const stats = {
    total:    tables.length,
    free:     tables.filter(t => t.status === 'free').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    pending:  tables.filter(t => t.status === 'pending').length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400 text-lg">Cargando mesas...</p>
    </div>
  );

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',       value: stats.total,    color: 'text-white'       },
          { label: 'Disponibles', value: stats.free,     color: 'text-emerald-400' },
          { label: 'Ocupadas',    value: stats.occupied, color: 'text-red-400'     },
          { label: 'Pendientes',  value: stats.pending,  color: 'text-yellow-400'  },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {['all', 'free', 'occupied', 'pending'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {f === 'all' ? 'Todas' : STATUS_CONFIG[f]?.label}
          </button>
        ))}
      </div>

      {/* Grid de mesas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(table => {
          const cfg = STATUS_CONFIG[table.status] || STATUS_CONFIG.free;
          return (
            <div
              key={table.id}
              className={`${cfg.bg} border ${cfg.border} rounded-xl p-5 cursor-pointer hover:scale-105 transition-transform`}
              onClick={() => onSelectTable?.(table)}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-white font-bold text-xl">{table.name}</span>
                <span className={`flex items-center gap-1 text-xs ${cfg.text}`}>
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                  {cfg.label}
                </span>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                👥 {table.capacity} personas
              </p>

              <div className="flex gap-2 flex-wrap">
                {table.status !== 'free' && (
                  <button
                    onClick={e => { e.stopPropagation(); changeStatus(table.id, 'free'); }}
                    className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-2 py-1 rounded-lg hover:bg-emerald-500/40"
                  >
                    Liberar
                  </button>
                )}
                {table.status !== 'occupied' && (
                  <button
                    onClick={e => { e.stopPropagation(); changeStatus(table.id, 'occupied'); }}
                    className="text-xs bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-1 rounded-lg hover:bg-red-500/40"
                  >
                    Ocupar
                  </button>
                )}
                {table.status !== 'pending' && (
                  <button
                    onClick={e => { e.stopPropagation(); changeStatus(table.id, 'pending'); }}
                    className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-2 py-1 rounded-lg hover:bg-yellow-500/40"
                  >
                    Pendiente
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
