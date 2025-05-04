'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

interface Product {
  id: number;
  name: string;
  description: string;
  price_per_gram: number;
  category: number;
  form_type: number | null;
  is_active: number;
  packaging: number[];
  packaging_names: string | null;
}

interface Packaging {
  id: number;
  name: string;
  form_type: number | null;
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

      // Преобразуем packaging_ids в массив
      const updatedProducts = productsData.map(product => ({
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

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/products?id=${editingProduct?.id}`, {
        method: editingProduct?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });

      if (!response.ok) throw new Error('Ошибка сохранения');
      fetchData();
      setEditingProduct(null);
    } catch (error) {
      console.error('Ошибка сохранения товара:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот продукт?')) return;
    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Ошибка удаления');
      fetchData();
    } catch (error) {
      console.error('Ошибка удаления продукта:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className='py-4 px-12'>
        <div className="flex justify-between items-center mb-6 ">
          <h1 className="text-2xl font-bold">Управление товарами</h1>
          <button 
            onClick={() => setEditingProduct({
              id: 0,
              name: '',
              description: '',
              price_per_gram: 0,
              category: 0,
              form_type: null,
              is_active: 1,
              packaging: [],
              packaging_names: null
            })}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Добавить товар
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Название</th>
                <th className="px-4 py-2">Цена за гр. / ед.</th>
                <th className="px-4 py-2">Категория</th>
                <th className="px-4 py-2">Статус</th>
                <th className="px-4 py-2">Упаковка</th>
                <th className="px-4 py-2">Действия</th>
              </tr>
            </thead>
            <tbody className="text-black">
              {products.map(product => (
                <tr key={product.id} className="border-t">
                  <td className="px-4 py-2">{product.id}</td>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.price_per_gram} ₽</td>
                  <td className="px-4 py-2">
                    {categories.find(c => c.id === product.category)?.name || 'Неизвестная категория'}
                  </td>
                  <td className="px-4 py-2">
                    {product.is_active ? 'Активен' : 'Неактивен'}
                  </td>
                  <td className="px-4 py-2">
                    {product.packaging_names?.split(',').join(', ') || '-'}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button 
                      onClick={() => setEditingProduct(product)}
                      className="text-blue-500 hover:underline"
                    >
                      Редактировать
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:underline"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Модальное окно редактирования */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black text-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingProduct.id ? 'Редактировать товар' : 'Добавить товар'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Название</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      name: e.target.value
                    })}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Описание</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      description: e.target.value
                    })}
                    className="w-full border p-2 rounded"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block mb-1">Цена за гр. / ед.</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.price_per_gram}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      price_per_gram: parseFloat(e.target.value)
                    })}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Категория</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      category: parseInt(e.target.value)
                    })}
                    className="w-full border p-2 rounded"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Тип формы</label>
                  <select
                    value={editingProduct.form_type || ''}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      form_type: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="w-full border p-2 rounded"
                  >
                    <option value="">Не выбрано</option>
                    {formTypes.map(ft => (
                      <option key={ft.id} value={ft.id}>{ft.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Упаковка</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                    {packagings.map(pkg => {
                      const isChecked = editingProduct.packaging.includes(pkg.id);
                      return (
                        <div key={pkg.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`pkg-${pkg.id}`}
                            checked={isChecked}
                            onChange={(e) => {
                              const updatedPackaging = e.target.checked
                                ? [...editingProduct.packaging, pkg.id]
                                : editingProduct.packaging.filter(id => id !== pkg.id);
                              setEditingProduct({ ...editingProduct, packaging: updatedPackaging });
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={`pkg-${pkg.id}`}>
                            {pkg.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editingProduct.is_active === 1}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      is_active: e.target.checked ? 1 : 0
                    })}
                    className="mr-2"
                  />
                  <label htmlFor="is_active">Активен</label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border rounded"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}