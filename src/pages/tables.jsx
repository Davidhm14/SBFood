import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

const STATUS_CONFIG = {
  free:     { label: 'Disponible', bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  occupied: { label: 'Ocupada',    bg: 'red-500/20',      border: 'border-red-500',     text: 'text-red-400',     dot: 'bg-red-500'    },
  pending:  { label: 'Pendiente',  bg: 'bg-yellow-500/20', border: 'border-yellow-500',  text: 'text-yellow-400',  dot: 'bg-yellow-500' },
};

export default function Tables({ onSelectTable }) {
  const api = useApi();
  const [tables, setTables]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  
  // CRUD Mesas
  const [showForm, setShowForm]     = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);

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

  // CRUD - Crear mesa
  async function createTable() {
    if (!newTableName.trim()) return;
    await api.post('/tables', { 
      name: newTableName.trim(), 
      capacity: parseInt(newTableCapacity) || 4 
    });
    setNewTableName(''); 
    setNewTableCapacity(4); 
    setShowForm(false);
    fetchTables();
  }

  // CRUD - Editar mesa
  async function editTable() {
    if (!editingTable || !newTableName.trim()) return;
    await api.put(`/tables/${editingTable.id}`, { 
      name: newTableName.trim(), 
      capacity: parseInt(newTableCapacity) || 4 
    });
    setEditingTable(null);
    setNewTableName(''); 
    setNewTableCapacity(4);
    fetchTables();
  }

  // CRUD - Eliminar mesa
  async function deleteTable(tableId) {
    if (!confirm('¿Eliminar esta mesa?')) return;
    await api.delete(`/tables/${tableId}`);
    fetchTables();
  }

  // Abrir form editar
  function edit(table) {
    setEditingTable(table);
    setNewTableName(table.name);
    setNewTableCapacity(table.capacity);
    setShowForm(true);
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
      {/* Botón Nueva Mesa */}
      <div className="mb-6">
        <button
          onClick={() => {
            setShowForm(true);
            setEditingTable(null);
            setNewTableName('');
            setNewTableCapacity(4);
          }}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg"
        >
          ➕ Nueva Mesa
        </button>
      </div>

      {/* Form CRUD */}
      {showForm && (
        <div className="bg-slate-800 border-2 border-orange-500 rounded-2xl p-6 mb-8 shadow-2xl">
          <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
            {editingTable ? '✏️ Editar Mesa' : '➕ Nueva Mesa'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-slate-300 font-medium mb-2">Nombre de la mesa</label>
              <input
                value={newTableName}
                onChange={e => setNewTableName(e.target.value)}
                placeholder="Mesa 1, VIP, Terraza, etc."
                className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-2">Capacidad (personas)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newTableCapacity}
                onChange={e => setNewTableCapacity(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={editingTable ? editTable : createTable}
              disabled={!newTableName.trim()}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              {editingTable ? 'Actualizar Mesa' : 'Crear Mesa'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingTable(null);
                setNewTableName('');
                setNewTableCapacity(4);
              }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',       value: stats.total,    color: 'text-white'       },
          { label: 'Disponibles', value: stats.free,     color: 'text-emerald-400' },
          { label: 'Ocupadas',    value: stats.occupied, color: 'text-red-400'     },
          { label: 'Pendientes',  value: stats.pending,  color: 'text-yellow-400'  },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl p-4 text-center">
            <p className={`text-2xl md:text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'free', 'occupied', 'pending'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {f === 'all' ? 'Todas' : STATUS_CONFIG[f]?.label}
          </button>
        ))}
      </div>

      {/* Grid de mesas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
        {filtered.map(table => {
          const cfg = STATUS_CONFIG[table.status] || STATUS_CONFIG.free;
          return (
            <div
              key={table.id}
              className={`${cfg.bg} border-2 ${cfg.border} rounded-xl p-5 cursor-pointer hover:scale-105 transition-all shadow-lg hover:shadow-orange-500/25`}
              onClick={() => onSelectTable?.(table)}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-white font-bold text-lg md:text-xl truncate">{table.name}</span>
                <div className="flex flex-col items-end gap-1">
                  <span className={`w-3 h-3 rounded-full ${cfg.dot}`}></span>
                  <span className={`text-xs ${cfg.text} font-medium`}>{cfg.label}</span>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                👥 {table.capacity} personas
              </p>

              {/* Botones estado */}
              <div className="flex gap-1 flex-wrap mb-3">
                {table.status !== 'free' && (
                  <button
                    onClick={e => { e.stopPropagation(); changeStatus(table.id, 'free'); }}
                    className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-2 py-1 rounded-lg hover:bg-emerald-500/40 transition-all flex-1"
                  >
                    Liberar
                  </button>
                )}
                {table.status !== 'occupied' && (
                  <button
                    onClick={e => { e.stopPropagation(); changeStatus(table.id, 'occupied'); }}
                    className="text-xs bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-1 rounded-lg hover:bg-red-500/40 transition-all flex-1"
                  >
                    Ocupar
                  </button>
                )}
                {table.status !== 'pending' && (
                  <button
                    onClick={e => { e.stopPropagation(); changeStatus(table.id, 'pending'); }}
                    className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-2 py-1 rounded-lg hover:bg-yellow-500/40 transition-all flex-1"
                  >
                    Pendiente
                  </button>
                )}
              </div>

              {/* Botones CRUD */}
              <div className="flex gap-1 pt-2 border-t border-slate-700/50">
                <button
                  onClick={e => { e.stopPropagation(); edit(table); }}
                  className="flex-1 text-xs bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 px-2 py-1 rounded border border-orange-500/50 transition-all"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={e => { e.stopPropagation(); deleteTable(table.id); }}
                  className="flex-1 text-xs bg-red-500/20 hover:bg-red-500/40 text-red-400 px-2 py-1 rounded border border-red-500/50 transition-all"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg mb-4">No hay mesas {filter !== 'all' && `(${STATUS_CONFIG[filter]?.label})`}</p>
          <p className="text-slate-500 text-sm">Crea la primera mesa con el botón arriba</p>
        </div>
      )}
    </div>
  );
}
