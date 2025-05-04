'use client';
import { useEffect, useState, useRef } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer'


interface Packaging {
  id: number;
  name: string;
  material: string | null;
  volume: number;
  unit: string | null;
  image: string | null;
  form_type_name: string | null;
}

interface FormType {
  id: number;
  name: string;
}

export default function PackingsPage() {
  const [packagings, setPackagings] = useState<Packaging[]>([]);
  const [formTypes, setFormTypes] = useState<FormType[]>([]);
  const [editingPacking, setEditingPacking] = useState<Packaging | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
    fetchFormTypes();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/packings');
      if (!res.ok) throw new Error('Ошибка загрузки данных');
      const data = await res.json();
      setPackagings(data);
      setIsLoading(false);
    } catch (err) {
      setError('Не удалось загрузить упаковки');
      console.error(err);
    }
  };

  const fetchFormTypes = async () => {
    try {
      const res = await fetch('/api/admin/products?data=form_types');
      if (!res.ok) throw new Error('Ошибка загрузки типов форм');
      const data = await res.json();
      setFormTypes(data);
    } catch (err) {
      console.error('Ошибка загрузки типов форм:', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = 'dataTransfer' in e ? e.dataTransfer.files : e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        alert('Загрузите изображение');
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    try {
      const method = editingPacking?.id ? 'PUT' : 'POST';
      const url = editingPacking?.id 
        ? `/api/admin/packings?id=${editingPacking.id}` 
        : '/api/admin/packings';
      const formData = new FormData();
      formData.append('name', editingPacking!.name);
      formData.append('material', editingPacking!.material || '');
      formData.append('volume', editingPacking!.volume.toString());
      formData.append('unit', editingPacking!.unit || '');
      formData.append('form_type', (editingPacking!.form_type || '').toString());
      if (imageFile) {
        formData.append('image', imageFile);
      }
      const res = await fetch(url, {
        method,
        body: formData,
      });
      if (!res.ok) throw new Error('Ошибка сохранения');
      fetchData();
      setEditingPacking(null);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Ошибка сохранения упаковки:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту упаковку?')) return;
    try {
      const res = await fetch(`/api/admin/packings?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Ошибка удаления');
      fetchData();
    } catch (error) {
      console.error('Ошибка удаления упаковки:', error);
    }
  };

  return (
    <div className="bg-[var(--color-dark)] text-[var(--color-white)] min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Основной контент */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-12 px-4 min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Управление упаковками</h2>
            <button 
              onClick={() => setEditingPacking({
                id: 0,
                name: '',
                material: '',
                volume: 0,
                unit: '',
                image: '',
                form_type_name: ''
              })}
              className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded hover:opacity-90 transition-opacity"
            >
              Добавить упаковку
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border border-[var(--color-gray)]">
              <thead className="bg-[var(--color-gray)]">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Название</th>
                  <th className="px-4 py-2">Материал</th>
                  <th className="px-4 py-2">Объем</th>
                  <th className="px-4 py-2">Ед. измерения</th>
                  <th className="px-4 py-2">Тип формы</th>
                  <th className="px-4 py-2">Изображение</th>
                  <th className="px-4 py-2">Действия</th>
                </tr>
              </thead>
              <tbody className="text-black">
                {packagings.map(packing => (
                  <tr 
                    key={packing.id} 
                    className="hover:bg-[var(--color-dark)] text-white transition-colors border-t border-[var(--color-gray)]"
                  >
                    <td className="border-b border-[var(--color-gray)] px-4 py-3">{packing.id}</td>
                    <td className="border-b border-[var(--color-gray)] px-4 py-3">{packing.name}</td>
                    <td className="border-b border-[var(--color-gray)] px-4 py-3">{packing.material || '-'}</td>
                    <td className="border-b border-[var(--color-gray)] px-4 py-3">{packing.volume}</td>
                    <td className="border-b border-[var(--color-gray)] px-4 py-3">{packing.unit || '-'}</td>
                    <td className="border-b border-[var(--color-gray)] px-4 py-3">
                      {packing.form_type_name || '-'}
                    </td>
                    <td className="border-b border-[var(--color-gray)] px-4 py-3">
                      {packing.image ? (
                        <img 
                          src={packing.image} 
                          alt="Упаковка" 
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : '-'}
                    </td>
                    <td className="border-b border-[var(--color-gray)] px-4 py-3 flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingPacking(packing);
                          setImagePreview(packing.image || null);
                        }}
                        className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded hover:opacity-90 transition-opacity"
                      >
                        Редактировать
                      </button>
                      <button 
                        onClick={() => handleDelete(packing.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Модальное окно */}
          {editingPacking && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
              <div className="bg-[var(--color-dark)] p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  {editingPacking.id ? 'Редактировать упаковку' : 'Добавить упаковку'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1">Название</label>
                    <input
                      type="text"
                      value={editingPacking.name}
                      onChange={(e) => setEditingPacking({
                        ...editingPacking,
                        name: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1">Материал</label>
                    <input
                      type="text"
                      value={editingPacking.material || ''}
                      onChange={(e) => setEditingPacking({
                        ...editingPacking,
                        material: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1">Объем</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingPacking.volume}
                      onChange={(e) => setEditingPacking({
                        ...editingPacking,
                        volume: parseFloat(e.target.value)
                      })}
                      className="w-full px-3 py-2 border rounded bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1">Единица измерения</label>
                    <input
                      type="text"
                      value={editingPacking.unit || ''}
                      onChange={(e) => setEditingPacking({
                        ...editingPacking,
                        unit: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1">Тип формы</label>
                    <select
                      value={editingPacking.form_type_name || ''}
                      onChange={(e) => {
                        const selectedFormType = formTypes.find(ft => ft.name === e.target.value);
                        setEditingPacking({
                          ...editingPacking,
                          form_type_name: e.target.value,
                          form_type: selectedFormType?.id || null
                        });
                      }}
                      className="w-full px-3 py-2 border rounded bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    >
                      <option value="">Не выбрано</option>
                      {formTypes.map(ft => (
                        <option key={ft.id} value={ft.name}>
                          {ft.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <label className="block mb-1">Изображение</label>
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleImageUpload}
                      className="border-2 border-dashed border-[var(--color-gray)] p-4 rounded text-center cursor-pointer hover:bg-[var(--color-dark)] relative"
                    >
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Превью" 
                          className="max-w-full h-auto mb-2"
                        />
                      ) : (
                        <p>Перетащите изображение или нажмите для выбора</p>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        ref={fileInputRef}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <button
                        onClick={handleButtonClick}
                        className="mt-2 px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded hover:opacity-90 transition-opacity"
                      >
                        Выбрать файл
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setEditingPacking(null);
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="px-4 py-2 bg-[var(--color-gray)] text-[var(--color-dark)] rounded hover:opacity-90 transition-opacity"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Сохранить
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