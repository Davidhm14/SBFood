import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

const PAYMENT_METHODS = [
  { id: 'cash',           label: '💵 Efectivo'  },
  { id: 'card',           label: '💳 Tarjeta'   },
  { id: 'digital_wallet', label: '📱 Billetera' },
];

export default function TicketsPage() {
  const api = useApi();
  const [pendingOrders, setPendingOrders]   = useState([]);
  const [selectedOrder, setSelectedOrder]   = useState(null);
  const [paymentMethod, setPaymentMethod]   = useState('cash');
  const [products, setProducts]             = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [loading, setLoading]               = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [orders, prods] = await Promise.all([
      api.get('/orders'),
      api.get('/products'),
    ]);
    const pending = Array.isArray(orders)
      ? orders.filter(o => o.status === 'pending_payment')
      : [];
    setPendingOrders(pending);
    if (Array.isArray(prods)) setProducts(prods);
    if (selectedOrder) {
      const still = pending.find(o => o.id === selectedOrder.id);
      setSelectedOrder(still || null);
    }
    setLoading(false);
  }

  async function handleAddItem(product) {
    if (!selectedOrder) return;
    await api.post(`/orders/${selectedOrder.id}/items`, { productId: product.id, quantity: 1 });
    setShowAddProduct(false);
    await fetchData();
  }

  async function handleRemoveItem(itemId) {
    if (!selectedOrder) return;
    await api.delete(`/orders/${selectedOrder.id}/items/${itemId}`);
    await fetchData();
  }

  async function handleCheckout() {
    if (!selectedOrder) return;
    const res = await api.patch(`/orders/${selectedOrder.id}/checkout`, { paymentMethod });
    if (res?.id) {
      setSelectedOrder(null);
      setPaymentMethod('cash');
      setShowAddProduct(false);
      await fetchData();
    }
  }

  const fmt = (val) => `$ ${Number(val || 0).toLocaleString('es-CO')}`;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400 text-lg">Cargando tickets...</p>
    </div>
  );

  // Altura total disponible: ventana - navbar(65px) - padding top/bottom main(64px) - título(52px)
  const PAGE_HEIGHT = 'calc(100vh - 181px)';

  return (
  <div className="flex gap-6 items-start">

      {/* ── Lista pendientes ── */}
      <div className="w-72 shrink-0 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <h3 className="text-white font-semibold">Pendientes de cobro</h3>
          {pendingOrders.length > 0 && (
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full border border-yellow-500/50">
              {pendingOrders.length}
            </span>
          )}
        </div>

        {pendingOrders.length === 0 ? (
          <div className="bg-slate-800 rounded-xl flex-1 flex items-center justify-center">
            <p className="text-slate-500 text-sm text-center px-4">Sin comandas pendientes</p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
            {pendingOrders.map(order => (
              <button
                key={order.id}
                onClick={() => {
                  setSelectedOrder(order);
                  setPaymentMethod('cash');
                  setShowAddProduct(false);
                }}
                className={`w-full text-left bg-slate-800 border rounded-xl p-4 transition-all ${
                  selectedOrder?.id === order.id
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-semibold">Comanda #{order.id}</span>
                  <span className="text-emerald-400 font-bold text-sm">{fmt(order.total)}</span>
                </div>
                <p className="text-slate-400 text-xs">🪑 {order.Table?.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{order.OrderItems?.length} producto(s)</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Factura ── */}
      <div className="flex-1 min-h-0">
        {!selectedOrder ? (
          <div className="bg-slate-800 rounded-xl h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl mb-3">🧾</p>
              <p className="text-slate-400">Selecciona una comanda para cobrar</p>
            </div>
          </div>
        ) : (
          // GRID: header(auto) | items(1fr) | footer(auto)
          // items crece hasta llenar el espacio y solo ahí aparece scroll
          <div className="bg-slate-800 rounded-xl p-6">

            {/* Fila 1 — Header */}
            <div className="flex justify-between items-start pb-4 mb-4 border-b border-slate-700">
              <div>
                <h3 className="text-white font-bold text-xl">Comanda #{selectedOrder.id}</h3>
                <p className="text-slate-400 text-sm mt-1">🪑 {selectedOrder.Table?.name}</p>
              </div>
              <span className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1 rounded-full border border-yellow-500/50">
                Pendiente de pago
              </span>
            </div>

            {/* Fila 2 — Items: ocupa todo el espacio libre, scroll solo si desborda */}
            <div className="space-y-2 mb-4">
              {selectedOrder.OrderItems?.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-slate-700 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{item.Product?.name}</p>
                    <p className="text-slate-400 text-xs">{item.quantity} × {fmt(item.unit_price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400 font-bold">
                      {fmt(parseFloat(item.unit_price) * item.quantity)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-300 text-xl leading-none"
                    >×</button>
                  </div>
                </div>
              ))}

              {showAddProduct ? (
                <div className="bg-slate-700 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300 text-sm font-medium">Agregar producto</span>
                    <button onClick={() => setShowAddProduct(false)} className="text-slate-500 text-xs hover:text-slate-300">✕ cerrar</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto">
                    {products.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleAddItem(p)}
                        className="bg-slate-600 hover:bg-slate-500 rounded-lg p-2 text-left transition-colors"
                      >
                        <p className="text-white text-xs font-medium truncate">{p.name}</p>
                        <p className="text-orange-400 text-xs">{fmt(p.price)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="w-full border border-dashed border-slate-600 hover:border-orange-500 text-slate-400 hover:text-orange-400 rounded-lg py-2.5 text-sm transition-colors"
                >
                  + Agregar producto
                </button>
              )}
            </div>

            {/* Fila 3 — Footer: SIEMPRE visible, nunca se mueve */}
            <div className="border-t border-slate-700 pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold text-lg">Total</span>
                <span className="text-white text-3xl font-bold">{fmt(selectedOrder.total)}</span>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">Medio de pago</p>
                <div className="grid grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`py-3 rounded-xl text-sm font-semibold transition-colors ${
                        paymentMethod === m.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors text-lg"
              >
                ✅ Cobrar {fmt(selectedOrder.total)}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
