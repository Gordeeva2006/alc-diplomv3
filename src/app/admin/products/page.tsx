'use client';
import { useEffect, useState, useMemo } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdminHeader from '../AdminHeader';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  description: string;
  price_per_gram: number;
  category: number;
  form_type: number | null;
  is_active: number;
  packaging_ids: string | null;
  packaging: number[];
  packaging_names: string | null;
}
interface Packaging {
  id: number;
  name: string;
  image: string;
  material_name: string;
  unit_name: string;
  volume: number;
}
interface Category {
  id: number;
  name: string;
}
interface FormType {
  id: number;
  name: string;
}
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [packagings, setPackagings] = useState<Packaging[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formTypes, setFormTypes] = useState<FormType[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; productId: number | null }>({ open: false, productId: null });

  // Загрузка данных
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, packagingsRes, categoriesRes, formTypesRes] = await Promise.all([
        fetch('/api/admin/products?data=products'),
        fetch('/api/admin/products?data=packagings'),
        fetch('/api/admin/products?data=categories'),
        fetch('/api/admin/products?data=form_types')
      ]);
      if (!productsRes.ok || !packagingsRes.ok || !categoriesRes.ok || !formTypesRes.ok) {
        throw new Error('Ошибка загрузки данных');
      }
      const productsData = await productsRes.json();
      const packagingsData = await packagingsRes.json();
      const categoriesData = await categoriesRes.json();
      const formTypesData = await formTypesRes.json();
      const updatedProducts = productsData.map((product: Product) => ({
        ...product,
        packaging: product.packaging_ids 
          ? product.packaging_ids.split(',').map(Number) 
          : [],
      }));
      setProducts(updatedProducts);
      setPackagings(packagingsData);
      setCategories(categoriesData);
      setFormTypes(formTypesData);
      setIsLoading(false);
    } catch (err) {
      setError('Не удалось загрузить данные');
      console.error(err);
    }
  };

  // Валидация перед сохранением
  const validateProduct = (product: Product) => {
    if (!product.name.trim()) {
      setModal({ open: true, message: 'Введите название продукта' });
      return false;
    }
    if (!product.price_per_gram || product.price_per_gram <= 0) {
      setModal({ open: true, message: 'Цена должна быть больше нуля' });
      return false;
    }
    if (!product.category) {
      setModal({ open: true, message: 'Выберите категорию' });
      return false;
    }
    return true;
  };

  // Сохранение продукта
  const handleSave = async () => {
    if (!editingProduct) return;
    if (!validateProduct(editingProduct)) {
      return;
    }
    try {
      const method = editingProduct.id ? 'PUT' : 'POST';
      const url = editingProduct.id 
        ? `/api/admin/products?id=${editingProduct.id}` 
        : '/api/admin/products';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Ошибка сохранения');
      }
      fetchData();
      setEditingProduct(null);
    } catch (error) {
      console.error('Ошибка сохранения Продукции:', error);
      setModal({ open: true, message: 'Не удалось сохранить продукт. Пожалуйста, попробуйте снова.' });
    }
  };

  // Удаление продукта
  const handleDelete = async (id: number) => {
    setDeleteModal({ open: true, productId: id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.productId) return;
    try {
      const res = await fetch(`/api/admin/products?id=${deleteModal.productId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Ошибка удаления');
      }
      fetchData();
      setDeleteModal({ open: false, productId: null });
    } catch (error) {
      console.error('Ошибка удаления продукта:', error);
      setModal({ open: true, message: 'Не удалось удалить продукт' });
    }
  };

  // Фильтрация продуктов
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || product.is_active === parseInt(statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  return (
    <div className="bg-[var(--color-dark)] text-[var(--color-white)] min-h-screen flex flex-col">
      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-[var(--color-dark)] p-6 rounded-lg max-w-md w-full mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ошибка</h3>
              <button 
                onClick={() => setModal({ open: false, message: '' })}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            <p className="text-white">{modal.message}</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModal({ open: false, message: '' })}
                className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded hover:bg-opacity-90"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-[var(--color-dark)] p-6 rounded-lg max-w-md w-full mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Подтверждение удаления</h3>
              <button 
                onClick={() => setDeleteModal({ open: false, productId: null })}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            <p className="text-white">Вы уверены, что хотите удалить этот продукт?</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded hover:bg-opacity-90"
              >
                ОК
              </button>
              <button
                onClick={() => setDeleteModal({ open: false, productId: null })}
                className="px-4 py-2 bg-[var(--color-gray)] text-[var(--color-dark)] rounded hover:bg-opacity-90"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <AdminHeader />
      {/* Основной контент */}
      <main className="flex-grow p-6">
        <div className="max-w-9xl mx-auto py-12 px-4 min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Управление продукцией</h1>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Поиск по продуктам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="">Все</option>
                <option value="1">Активные</option>
                <option value="0">Неактивные</option>
              </select>
              <button 
                onClick={() => setEditingProduct({
                  id: 0,
                  name: '',
                  description: '',
                  price_per_gram: 0,
                  category: 0,
                  form_type: null,
                  is_active: 1,
                  packaging_ids: '',
                  packaging: [],
                  packaging_names: null
                })}
                className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity"
              >
                Добавить товар
              </button>
            </div>
          </div>
          {/* Таблица продуктов */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-accent)]"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 bg-[var(--color-gray)] rounded-lg mb-6">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--color-gray)]">
                <thead className="bg-[var(--color-gray)]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Название</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Цена за грамм</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Категория</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Статус</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Упаковки</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-gray)]">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[var(--color-gray)]">
                        <p className="text-lg mb-2">Продукты не найдены</p>
                        <p className="text-sm">Добавьте первый продукт, чтобы начать работу</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-[var(--color-gray)] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">{product.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.price_per_gram} <span className='text-lg font-light'>₽</span></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {categories.find(c => c.id === product.category)?.name || 'Неизвестная категория'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded ${
                            product.is_active 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-red-900 text-red-300'
                          }`}>
                            {product.is_active ? 'Активен' : 'Неактивен'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-pre-line">
                          {product.packaging_names?.split('<br>').map((line, idx) => (
                            <span key={idx}>
                              {line}
                              <br />
                            </span>
                          )) || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button 
                            onClick={() => setEditingProduct(product)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                          >
                            Редактировать
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {/* Модальное окно редактирования */}
          {editingProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 overflow-y-auto">
              <div className="bg-[var(--color-dark)] p-8 rounded-lg w-full max-w-3xl mx-auto my-8">
                <h2 className="text-2xl font-bold mb-6 border-b border-[var(--color-gray)] pb-3">
                  {editingProduct.id ? 'Редактировать товар' : 'Добавить товар'}
                </h2>
                <div className="space-y-6 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Название</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        name: e.target.value
                      })}
                      className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Описание</label>
                    <textarea
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        description: e.target.value
                      })}
                      className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 text-sm font-medium">Цена за грамм</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingProduct.price_per_gram}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          price_per_gram: parseFloat(e.target.value) || 0
                        })}
                        className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium">Категория</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          category: parseInt(e.target.value)
                        })}
                        className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium">Тип формы</label>
                      <select
                        value={editingProduct.form_type || ''}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          form_type: e.target.value ? parseInt(e.target.value) : null
                        })}
                        className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      >
                        <option value="">Не выбрано</option>
                        {formTypes.map(ft => (
                          <option key={ft.id} value={ft.id}>{ft.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium">Статус</label>
                      <div className="flex items-center mt-1">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={editingProduct.is_active === 1}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            is_active: e.target.checked ? 1 : 0
                          })}
                          className="w-5 h-5 rounded bg-[var(--color-dark)] border-[var(--color-gray)] checked:bg-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                        />
                        <label htmlFor="is_active" className="ml-2 text-sm">
                          {editingProduct.is_active === 1 ? 'Активен' : 'Неактивен'}
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Доступные упаковки</label>
                    <div className="max-h-60 overflow-y-auto border border-[var(--color-gray)] rounded p-4 bg-[var(--color-dark)]">
                      {packagings.length === 0 ? (
                        <p className="text-center text-[var(--color-gray)] col-span-3">Нет доступных упаковок</p>
                      ) : (
                        packagings.map(pkg => {
                          const isChecked = editingProduct.packaging.includes(pkg.id);
                          return (
                            <div key={pkg.id} className="flex items-center p-2 hover:bg-[var(--color-gray)] rounded">
                              <input
                                type="checkbox"
                                id={`pkg-${pkg.id}`}
                                checked={isChecked}
                                onChange={(e) => {
                                  const updatedPackaging = e.target.checked
                                    ? [...editingProduct.packaging, pkg.id]
                                    : editingProduct.packaging.filter(id => id !== pkg.id);
                                  setEditingProduct({ 
                                    ...editingProduct, 
                                    packaging: updatedPackaging 
                                  });
                                }}
                                className="w-5 h-5 rounded mr-3 bg-[var(--color-dark)] border-[var(--color-gray)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                              />
                              <label htmlFor={`pkg-${pkg.id}`} className="flex-1">
                                <div className="flex items-center gap-2">
                                  {pkg.image ? (
                                    <Image
                                      src={`/${pkg.image}`}
                                      alt={pkg.name}
                                      width={32}
                                      height={32}
                                      className="w-8 h-8 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                      <span className="text-xs">No Image</span>
                                    </div>
                                  )}
                                  <div>
                                    <span>{pkg.name}</span>
                                    <span className="ml-2 text-[var(--color-gray)]">
                                      ({pkg.volume} {pkg.unit_name})
                                    </span>
                                  </div>
                                </div>
                              </label>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4 border-t border-[var(--color-gray)]">
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="px-5 py-2 bg-[var(--color-gray)] text-[var(--color-dark)] rounded hover:opacity-90 transition-opacity"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-5 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded hover:opacity-90 transition-opacity"
                  >
                    {editingProduct.id ? 'Сохранить изменения' : 'Добавить товар'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
}