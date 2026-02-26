import { useState, useEffect } from 'react';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/products';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/categories';
import { useAuth } from '../context/AuthContext';

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { token } = useAuth();

  // ✅ Carga inicial cuando cambia token
  useEffect(() => {
    if (token) {
      loadProducts();
      loadCategories();
    }
  }, [token]);

  // ✅ Recarga datos al cambiar tab
  useEffect(() => {
    if (token) {
      activeTab === 'products' ? loadProducts() : loadCategories();
    }
  }, [activeTab, token]);

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error productos:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error categorías:', error);
    }
  };

  const handleSave = async (data) => {
    try {
      if (activeTab === 'products') {
        if (editItem) await updateProduct(editItem.id, data);
        else await createProduct(data);
        await loadProducts();
      } else {
        if (editItem) await updateCategory(editItem.id, data);
        else await createCategory(data);
        await loadCategories();
      }

      await loadCategories();
      setModalOpen(false);
      setEditItem(null);
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
    try {
      if (activeTab === 'products') {
        await deleteProduct(id);
        await loadProducts();
      } else {
        await deleteCategory(id);
        await loadCategories();
      }
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const items = activeTab === 'products' ? products : categories;

  return (
    <div className="p-6 text-white">
      {/* Tabs de navegación */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === 'products'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Productos
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === 'categories'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Categorías
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">
          {activeTab === 'products' ? 'Lista de productos' : 'Lista de categorías'}
        </h3>
        <button
          onClick={() => {
            setEditItem(null);
            setModalOpen(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm"
          disabled={!token}
        >
          + Nuevo {activeTab === 'products' ? 'producto' : 'categoría'}
        </button>
      </div>

      {/* Tabla */}
      <table className="w-full text-sm border border-slate-700 rounded-md overflow-hidden">
        <thead className="bg-slate-800 text-slate-300">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Nombre</th>
            {activeTab === 'products' && (
              <>
                <th className="px-4 py-2 text-left">Precio</th>
                <th className="px-4 py-2 text-left">Categoría</th>
              </>
            )}
            <th className="px-4 py-2 text-center">Estado</th>
            <th className="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-t border-slate-700 hover:bg-slate-800/50"
            >
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">{item.name}</td>

              {activeTab === 'products' && (
                <>
                 <td className="px-4 py-2">${parseFloat(item.price || 0).toFixed(2)}</td>
                  <td className="px-4 py-2">{item.Category?.name || '—'}</td>
                </>
              )}

              <td className="px-4 py-2 text-center">
                {item.active ? (
                  <span className="text-green-400">Activo</span>
                ) : (
                  <span className="text-slate-500">Inactivo</span>
                )}
              </td>

              <td className="px-4 py-2 text-center space-x-2">
                <button
                  onClick={() => {
                    setEditItem(item);
                    setModalOpen(true);
                  }}
                  className="text-orange-400 hover:text-orange-300"
                  disabled={!token}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-300"
                  disabled={!token}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td
                colSpan={activeTab === 'products' ? 6 : 4}
                className="text-center py-6 text-slate-400"
              >
                {!token ? 'Inicia sesión para ver datos' : 'No hay registros'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {modalOpen && (
        <ModalForm
          title={
            editItem
              ? `Editar ${activeTab === 'products' ? 'producto' : 'categoría'}`
              : `Nuevo ${activeTab === 'products' ? 'producto' : 'categoría'}`
          }
          item={editItem}
          categories={categories}
          onClose={() => {
            setModalOpen(false);
            setEditItem(null);
          }}
          onSave={handleSave}
          type={activeTab}
        />
      )}
    </div>
  );
}

// ModalForm SIN CAMBIOS (está perfecto)
function ModalForm({ title, item, categories, onClose, onSave, type }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    price: item?.price || '',
    category_id: item?.category_id || '',
    active: item?.active ?? true,
  });

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm({
      ...form,
      [name]: inputType === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4 text-white">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-slate-700 text-white rounded-md px-3 py-2 focus:ring focus:ring-orange-500"
              required
            />
          </div>

          {type === 'products' && (
            <>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full bg-slate-700 text-white rounded-md px-3 py-2 focus:ring focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Categoría</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="w-full bg-slate-700 text-white rounded-md px-3 py-2 focus:ring focus:ring-orange-500"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="mr-2 accent-orange-500"
            />
            <span className="text-slate-300 text-sm">Activo</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-md text-white"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
