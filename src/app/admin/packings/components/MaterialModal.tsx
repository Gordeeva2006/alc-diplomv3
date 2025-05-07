'use client';
import { Material } from '@/app/admin/packings/types';

interface Props {
  editingMaterial: Material | null;
  setEditingMaterial: React.Dispatch<React.SetStateAction<Material | null>>;
  handleSaveMaterial: () => void;
}

export default function MaterialModal({
  editingMaterial,
  setEditingMaterial,
  handleSaveMaterial
}: Props) {
  if (!editingMaterial) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.trim();
    setEditingMaterial({ 
      ...editingMaterial, 
      name: newName 
    });
  };

  const handleSave = () => {
    // Простая валидация
    if (!editingMaterial.name.trim()) {
      alert('Введите название материала');
      return;
    }
    handleSaveMaterial();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-[var(--color-dark)] p-6 rounded-lg w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 border-b border-[var(--color-gray)] pb-3">
          {editingMaterial.id ? 'Редактировать' : 'Добавить'} материал
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium">Название материала</label>
            <input
              value={editingMaterial.name}
              onChange={handleNameChange}
              className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder="Введите название материала"
              maxLength={255}
            />
            <p className="mt-1 text-xs text-[var(--color-gray)]">Максимум 255 символов</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-4 pt-4 border-t border-[var(--color-gray)]">
          <button
            onClick={() => setEditingMaterial(null)}
            type="button"
            className="px-5 py-2 bg-[var(--color-gray)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            type="button"
            className="px-5 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded-lg hover:opacity-90 transition-opacity"
          >
            {editingMaterial.id ? 'Сохранить изменения' : 'Добавить материал'}
          </button>
        </div>
      </div>
    </div>
  );
}