'use client';
import { useEffect, useState } from 'react';
import CategoryTable from './components/CategoryTable';
import CategoryModal from './components/CategoryModal';
import { Category } from './types';
import AdminHeader from '../AdminHeader';

export default function CategoriesPage() {
  // Состояния
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Ошибка загрузки данных');
      const data = await res.json();
      setCategories(data);
      setIsLoading(false);
    } catch (err) {
      setError('Не удалось загрузить категории');
      console.error(err);
    }
  };

  // CRUD
  const handleSave = async () => {
    if (!editingCategory) return;
    
    try {
      const method = editingCategory.id ? 'PUT' : 'POST';
      const url = editingCategory.id 
        ? `/api/admin/categories?id=${editingCategory.id}` 
        : '/api/admin/categories';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory)
      });
      
      if (!res.ok) throw new Error('Ошибка сохранения');
      
      fetchData();
      setEditingCategory(null);
    } catch (error) {
      console.error('Ошибка сохранения категории:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;
    
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Ошибка удаления');
      
      fetchData();
    } catch (error) {
      console.error('Ошибка удаления категории:', error);
    }
  };

  return (
    <div className="bg-[var(--color-dark)] text-white min-h-screen flex flex-col">
      {/* Header */}
      <AdminHeader />
      
      {/* Основной контент */}
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto py-12 px-4 min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Управление категориями</h2>
            <button 
              onClick={() => setEditingCategory({ id: 0, name: '', description: '' })}
              className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded mb-4"
            >
              Добавить категорию
            </button>
          </div>
          
          {/* Таблица категорий */}
          <CategoryTable 
            categories={categories} 
            setEditingCategory={setEditingCategory} 
            handleDelete={handleDelete} 
          />
          
          {/* Модальное окно */}
          {editingCategory && (
            <CategoryModal 
              editingCategory={editingCategory} 
              setEditingCategory={setEditingCategory} 
              handleSave={handleSave} 
            />
          )}
        </div>
      </main>
    
    </div>
  );
}