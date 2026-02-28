// src/pages/ProductsPage.jsx
import React, { useState, useEffect } from 'react';

const api = {
  get: async (url) => {
    const token = localStorage.getItem('sbfood_token');
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  post: async (url, body) => {
    const token = localStorage.getItem('sbfood_token');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  put: async (url, body) => {
    const token = localStorage.getItem('sbfood_token');
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  delete: async (url) => {
    const token = localStorage.getItem('sbfood_token');
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
};

const ProductsPage = () => {
  const [activeTab, setActiveTab]             = useState('products');
  const [products, setProducts]               = useState([]);
  const [categories, setCategories]           = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [showModal, setShowModal]             = useState(false);
  const [modalType, setModalType]             = useState('');
  const [editingProduct, setEditingProduct]   = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.get('/api/products/all'),
        api.get('/api/categories')
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      setError('Error cargando datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (formData) => {
    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.id}`, formData);
      } else {
        await api.post('/api/products', formData);
      }
      setShowModal(false);
      setEditingProduct(null);
      await fetchAll();
    } catch (err) {
      setError('Error guardando producto: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      await fetchAll();
    } catch (err) {
      setError('Error eliminando producto: ' + err.message);
    }
  };

  const handleSaveCategory = async (formData) => {
    try {
      if (editingCategory) {
        await api.put(`/api/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/api/categories', formData);
      }
      setShowModal(false);
      setEditingCategory(null);
      await fetchAll();
    } catch (err) {
      setError('Error guardando categoría: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try {
      await api.delete(`/api/categories/${id}`);
      await fetchAll();
    } catch (err) {
      // ← Muestra el mensaje del backend (ej: "tiene X productos activos")
      setError(err.message);
    }
  };

  // ── FORMULARIO PRODUCTO ──────────────────────────────────
  const ProductForm = ({ onSubmit, defaultValues = {} }) => {
    const [name, setName]           = useState(defaultValues.name || '');
    const [price, setPrice]         = useState(defaultValues.price || '');
    // ✅ FIX: underscored:true → Sequelize retorna Category.id no categoryId
    const [categoryId, setCategoryId] = useState(
      defaultValues.Category?.id ||
      defaultValues.category_id ||
      defaultValues.categoryId ||
      ''
    );

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!name.trim()) return alert('Nombre requerido');
      if (!price || isNaN(price)) return alert('Precio inválido');
      onSubmit({
        name: name.trim(),
        price: parseFloat(price),
        categoryId: categoryId || null
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Nombre *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Ej: CocaCola"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Precio *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Sin categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {defaultValues.id ? '✏️ Actualizar' : '➕ Crear'} Producto
          </button>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  };

  // ── FORMULARIO CATEGORÍA ─────────────────────────────────
  const CategoryForm = ({ onSubmit, defaultValues = {} }) => {
    const [name, setName] = useState(defaultValues.name || '');

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!name.trim()) return alert('Nombre requerido');
      onSubmit({ name: name.trim() });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Nombre *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Ej: Bebidas"
            required
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {defaultValues.id ? '✏️ Actualizar' : '➕ Crear'} Categoría
          </button>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  };

  const fmt = (val) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val || 0);

  return (
    <div className="space-y-6">

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex justify-between items-center">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 text-xl leading-none">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-4 px-1 mr-8 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'products'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          📦 Productos ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'categories'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          🏷️ Categorías ({categories.length})
        </button>
      </div>

      {/* ── TAB PRODUCTOS ───────────────────────────────── */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-400 text-sm">
              {loading ? 'Cargando...' : `${products.length} productos`}
            </p>
            <button
              onClick={() => { setEditingProduct(null); setModalType('product'); setShowModal(true); }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              ➕ Nuevo Producto
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-slate-800 rounded-xl">
              <p className="text-slate-400">No hay productos. ¡Crea el primero!</p>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Categoría</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-300 uppercase">Precio</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-300 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-white">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {/* ✅ FIX: usa Category.name directo del include */}
                        <span className="bg-slate-700 px-2 py-1 rounded-full text-xs">
                          {product.Category?.name || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-emerald-400 font-bold text-right">
                        {fmt(product.price)}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button
                          onClick={() => { setEditingProduct(product); setModalType('product'); setShowModal(true); }}
                          className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded-lg hover:bg-blue-500/20 transition-colors"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB CATEGORÍAS ──────────────────────────────── */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-400 text-sm">{categories.length} categorías</p>
            <button
              onClick={() => { setEditingCategory(null); setModalType('category'); setShowModal(true); }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              ➕ Nueva Categoría
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12 bg-slate-800 rounded-xl">
              <p className="text-slate-400">No hay categorías. ¡Crea la primera!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="bg-slate-800 rounded-xl p-5 flex justify-between items-center border border-slate-700 hover:border-slate-500 transition-colors">
                  <div>
                    <p className="text-white font-semibold">{cat.name}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {/* ✅ FIX PRINCIPAL: usa Category.id del include */}
                      {products.filter(p => p.Category?.id === cat.id).length} productos
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingCategory(cat); setModalType('category'); setShowModal(true); }}
                      className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL ───────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">
                {modalType === 'product'
                  ? (editingProduct   ? '✏️ Editar Producto'  : '➕ Nuevo Producto')
                  : (editingCategory  ? '✏️ Editar Categoría' : '➕ Nueva Categoría')}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {modalType === 'product' ? (
                <ProductForm
                  onSubmit={handleSaveProduct}
                  defaultValues={editingProduct || {}}
                />
              ) : (
                <CategoryForm
                  onSubmit={handleSaveCategory}
                  defaultValues={editingCategory || {}}
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductsPage;
