// src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';

const ReportsPage = () => {
  const [reports, setReports]   = useState([]);
  const [summary, setSummary]   = useState({});
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null); // ← SIN alert()

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('sbfood_token');
      const res = await fetch(`/api/reports/daily?saleDate=${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReports(data.reports || []);
      setSummary(data.summary || {});
    } catch (err) {
      console.error('Error reports:', err);
      setError('No se pudieron cargar los reportes'); // ← Banner, no alert
      setReports([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  // ← Solo fetch cuando cambia fecha (no al montar)
  useEffect(() => {
    // No auto-fetch al montar para evitar error en arranque
  }, []);

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleBuscar = () => {
    fetchReports();
  };

  const exportCSV = () => {
    if (!reports.length) return;

    const csv = [
      ['Comanda', 'Mesa', 'Total', 'Fecha'],
      ...reports.map(r => [
        r.id,
        r.Table?.name || 'N/A',
        parseFloat(r.total || 0).toLocaleString('es-CO'),
        new Date(r.createdAt).toLocaleDateString('es-CO')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ventas-${date}.csv`;
    link.click();
  };

  const fmt = (val) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(val || 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Filtros */}
      <div className="bg-slate-800 p-6 rounded-xl">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleBuscar}
            disabled={loading}
            className="px-8 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            {loading ? '🔄 Cargando...' : '🔍 Buscar'}
          </button>

          <button
            onClick={exportCSV}
            disabled={!reports.length || loading}
            className="px-8 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors whitespace-nowrap sm:ml-auto"
          >
            📥 Export CSV
          </button>
        </div>

        {/* Error Banner (reemplaza alert) */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center justify-between">
            <p className="text-red-400 text-sm">⚠️ {error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 text-lg leading-none">×</button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-500/20 p-6 rounded-xl text-center border border-blue-500/30">
            <h3 className="text-3xl font-bold text-blue-300">{summary.ordersCount || 0}</h3>
            <p className="text-blue-400 mt-1">Órdenes</p>
          </div>
          <div className="bg-emerald-500/20 p-6 rounded-xl text-center border border-emerald-500/30">
            <h3 className="text-2xl font-bold text-emerald-300">{fmt(summary.totalSales)}</h3>
            <p className="text-emerald-400 mt-1">Total Ventas</p>
          </div>
          <div className="bg-orange-500/20 p-6 rounded-xl text-center border border-orange-500/30">
            <h3 className="text-2xl font-bold text-orange-300">{fmt(summary.avgTicket)}</h3>
            <p className="text-orange-400 mt-1">Ticket Promedio</p>
          </div>
          <div className="bg-purple-500/20 p-6 rounded-xl text-center border border-purple-500/30">
            <h3 className="text-3xl font-bold text-purple-300">{summary.topProducts?.length || 0}</h3>
            <p className="text-purple-400 mt-1">Top Productos</p>
          </div>
        </div>
      </div>

      {/* Top Productos */}
      {summary.topProducts?.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">🏆 Top Productos del Día</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.topProducts.map((p, i) => (
              <div key={p.name} className="bg-slate-700 rounded-lg p-4 flex items-center gap-3">
                <span className="text-2xl font-black text-orange-400/50">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{p.name}</p>
                  <p className="text-slate-400 text-xs">{p.qty} unidades</p>
                </div>
                <span className="text-emerald-400 font-bold text-sm">{fmt(p.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla Órdenes */}
      <div className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="text-slate-400 mt-4">Cargando reportes...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-5xl mb-4">📊</p>
            <p className="text-slate-400 text-lg">
              {error ? 'Error al cargar' : 'No hay ventas para esta fecha'}
            </p>
            <p className="text-slate-500 mt-2 text-sm">
              Selecciona una fecha y presiona 🔍 Buscar
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Comanda</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Mesa</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Fecha/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {reports.map((order) => (
                <tr key={order.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-white">
                    <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold">
                      #{order.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {order.Table?.name || 'Take Away'}
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-400 font-bold text-right">
                    {fmt(parseFloat(order.total || 0))}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(order.createdAt).toLocaleString('es-CO', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default ReportsPage;
