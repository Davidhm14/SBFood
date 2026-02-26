import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

const PAYMENT_METHODS = [
  { id: 'cash',           label: '💵 Efectivo'  },
  { id: 'card',           label: '💳 Tarjeta'   },
  { id: 'digital_wallet', label: '📱 Billetera' },
];

export default function CashPage() {
  const api = useApi();

  const [register, setRegister]         = useState(null);
  const [summary, setSummary]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [initialAmount, setInitialAmount] = useState('');
  const [finalAmount, setFinalAmount]   = useState('');
  const [notes, setNotes]               = useState('');

  // Factura seleccionada
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [products, setProducts]           = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => { fetchStatus(); }, []);

  async function fetchStatus() {
    setLoading(true);
    const [data, prods] = await Promise.all([
      api.get('/cash/summary'),
      api.get('/products'),
    ]);
    if (data?.open) {
      setRegister(data.register);
      setSummary(data);
      // refresca orden seleccionada si sigue pendiente
      if (selectedOrder) {
        const still = data.pendingOrders?.find(o => o.id === selectedOrder.id);
        setSelectedOrder(still || null);
      }
    } else {
      setRegister(null);
      setSummary(null);
      setSelectedOrder(null);
    }
    if (Array.isArray(prods)) setProducts(prods);
    setLoading(false);
  }

  async function handleOpen() {
    const res = await api.post('/cash/open', { initialAmount: parseFloat(initialAmount) || 0 });
    if (res?.id) { setInitialAmount(''); fetchStatus(); }
  }

  async function handleClose() {
    const res = await api.post('/cash/close', { finalAmount: parseFloat(finalAmount) || 0, notes });
    if (res?.id) { setFinalAmount(''); setNotes(''); setSelectedOrder(null); fetchStatus(); }
  }

  async function handleAddItem(product) {
    if (!selectedOrder) return;
    await api.post(`/orders/${selectedOrder.id}/items`, { productId: product.id, quantity: 1 });
    setShowAddProduct(false);
    fetchStatus();
  }

  async function handleRemoveItem(itemId) {
    if (!selectedOrder) return;
    await api.delete(`/orders/${selectedOrder.id}/items/${itemId}`);
    fetchStatus();
  }

  async function handleCheckout() {
    if (!selectedOrder) return;
    const res = await api.patch(`/orders/${selectedOrder.id}/checkout`, { paymentMethod });
    if (res?.id) { setSelectedOrder(null); setPaymentMethod('cash'); fetchStatus(); }
  }

  const fmt = (val) => `$ ${Number(val || 0).toLocaleString('es-CO')}`;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400 text-lg">Cargando caja...</p>
    </div>
  );

  return (
    <div>
      {/* ── Header turno ── */}
      <div className="bg-slate-800 rounded-xl p-5 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Caja Registradora</h2>
          <p className="text-slate-400 text-sm mt-1">
            {register
              ? `Turno abierto desde ${new Date(register.opened_at).toLocaleTimeString('es-CO')}`
              : 'Sin turno activo'}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          register
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
            : 'bg-slate-700 text-slate-400'
        }`}>
          {register ? '● Abierta' : '○ Cerrada'}
        </span>
      </div>

      {/* ── CAJA CERRADA ── */}
      {!register && (
        <div className="bg-slate-800 rounded-xl p-6 max-w-md mx-auto">
          <h3 className="text-white font-semibold text-lg mb-4">Abrir turno</h3>
          <label className="block text-slate-400 text-sm mb-1">Monto inicial en caja</label>
          <input
            type="number"
            value={initialAmount}
            onChange={e => setInitialAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 mb-5 outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleOpen}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Abrir Caja
          </button>
        </div>
      )}

      {/* ── CAJA ABIERTA ── */}
      {register && summary && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Monto Inicial',    value: fmt(register.initial_amount), color: 'text-white'       },
              { label: 'Total Vendido',    value: fmt(summary.totalSales),      color: 'text-emerald-400' },
              { label: 'Órdenes Cobradas', value: summary.totalOrders,          color: 'text-orange-400'  },
            ].map(s => (
              <div key={s.label} className="bg-slate-800 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-slate-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

        

          {/* Cerrar turno */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Cerrar turno</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Monto físico en caja</label>
                <input
                  type="number"
                  value={finalAmount}
                  onChange={e => setFinalAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Notas (opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Observaciones..."
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-red-500/80 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Cerrar Caja
            </button>
          </div>
        </>
      )}
    </div>
  );
}
