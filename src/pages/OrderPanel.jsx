import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export default function OrderPanel({ table, onClose, onOrderUpdate, onOrderClosed }) {
  const api = useApi();
  const [order, setOrder]                   = useState(null);
  const [products, setProducts]             = useState([]);
  const [categories, setCategories]         = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading]               = useState(true);

  useEffect(() => { loadData(); }, [table]);

  async function loadData() {
    setLoading(true);
    const [orderData, productsData] = await Promise.all([
      api.get(`/orders/table/${table.id}`),
      api.get('/products'),
    ]);

    if (Array.isArray(productsData)) {
      setProducts(productsData);
      const cats = [...new Map(
        productsData
          .filter(p => p.Category)
          .map(p => [p.Category.id, p.Category])
      ).values()];
      setCategories(cats);
    }

    setOrder(orderData);
    setLoading(false);
  }

  async function createOrder() {
    const newOrder = await api.post('/orders', { tableId: table.id });
    if (newOrder?.id) {
      setOrder(newOrder);
      onOrderUpdate?.();
    }
  }

  async function addItem(product) {
    if (!order) return;
    const updated = await api.post(`/orders/${order.id}/items`, {
      productId: product.id,
      quantity: 1,
    });
    if (updated?.id) {
      setOrder(updated);
      onOrderUpdate?.();
    }
  }

  async function removeItem(itemId) {
    if (!order) return;
    await api.delete(`/orders/${order.id}/items/${itemId}`);
    const updated = await api.get(`/orders/table/${table.id}`);
    setOrder(updated);
    onOrderUpdate?.();
  }

  // ← NUEVO: envía a caja en lugar de cobrar directo
  async function sendToCash() {
    if (!order) return;
    await api.patch(`/orders/${order.id}/send-to-cash`, {});
    onOrderClosed?.();
  }

  async function cancelOrder() {
    if (!order) return;
    await api.patch(`/orders/${order.id}/status`, { status: 'cancelled' });
    onOrderClosed?.();
  }

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.Category?.id === activeCategory);

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-slate-900 w-full max-w-4xl h-full flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">🪑 {table.name}</h2>
            <p className="text-slate-400 text-sm">👥 {table.capacity} personas</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">✕</button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400">Cargando...</p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">

            {/* Panel izquierdo — Productos */}
            <div className="flex-1 flex flex-col border-r border-slate-700">

              {/* Categorías */}
              <div className="flex gap-2 p-4 overflow-x-auto border-b border-slate-700">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    activeCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  Todos
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      activeCategory === cat.id ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Grid de productos */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 content-start">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => order ? addItem(product) : null}
                    disabled={!order}
                    className={`bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl p-4 text-left transition-all ${
                      !order ? 'opacity-40 cursor-not-allowed' : 'hover:border-orange-500'
                    }`}
                  >
                    <p className="text-white font-medium text-sm">{product.name}</p>
                    <p className="text-orange-400 font-bold mt-1">{formatPrice(product.price)}</p>
                    {product.Category && (
                      <span className="text-xs text-slate-500">{product.Category.name}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Botón crear comanda */}
              {!order && (
                <div className="p-4 border-t border-slate-700">
                  <button
                    onClick={createOrder}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    + Abrir comanda para {table.name}
                  </button>
                </div>
              )}
            </div>

            {/* Panel derecho — Comanda */}
            <div className="w-80 flex flex-col">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-white font-bold">
                  {order ? `Comanda #${order.id}` : 'Sin comanda activa'}
                </h3>
                {order && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                    {order.status === 'open' ? 'Abierta' : 'En progreso'}
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {!order ? (
                  <p className="text-slate-500 text-sm text-center mt-8">
                    Abre una comanda para agregar productos
                  </p>
                ) : order.OrderItems?.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center mt-8">
                    Sin productos aún
                  </p>
                ) : (
                  order.OrderItems?.map(item => (
                    <div key={item.id} className="bg-slate-800 rounded-lg p-3 flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{item.Product?.name}</p>
                        <p className="text-slate-400 text-xs">
                          {item.quantity} × {formatPrice(parseFloat(item.unit_price))}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400 text-sm font-bold">
                          {formatPrice(parseFloat(item.unit_price) * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300 text-lg leading-none"
                        >×</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total y acciones */}
              {order && (
                <div className="p-4 border-t border-slate-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Total</span>
                    <span className="text-white text-2xl font-bold">
                      {formatPrice(parseFloat(order.total) || 0)}
                    </span>
                  </div>

                  {/* ← NUEVO: Enviar a Caja en lugar de Cobrar directo */}
                  <button
                    onClick={sendToCash}
                    disabled={!order.OrderItems?.length}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    🧾 Enviar a Caja
                  </button>
                  <button
                    onClick={cancelOrder}
                    className="w-full bg-red-500/20 hover:bg-red-500/40 text-red-400 font-medium py-2 rounded-xl transition-colors text-sm"
                  >
                    Cancelar comanda
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
