'use client';
import { FormType } from '@/app/admin/packings/types';

interface Props {
  editingFormType: FormType | null;
  setEditingFormType: React.Dispatch<React.SetStateAction<FormType | null>>;
  handleSaveFormType: () => void;
}

export default function FormTypeModal({
  editingFormType,
  setEditingFormType,
  handleSaveFormType
}: Props) {
  if (!editingFormType) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.trim();
    setEditingFormType({ 
      ...editingFormType, 
      name: newName 
    });
  };

  const handleSave = () => {
    // Простая валидация
    if (!editingFormType.name.trim()) {
      alert('Введите название типа формы');
      return;
    }
    handleSaveFormType();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-[var(--color-dark)] p-6 rounded-lg w-full max-w-md mx-auto my-8">
        <h2 className="text-2xl font-bold mb-6 border-b border-[var(--color-gray)] pb-3">
          {editingFormType.id ? 'Редактировать' : 'Добавить'} тип формы
        </h2>
        
        <div className="space-y-6 mb-6">
          <div>
            <label className="block mb-2 text-sm font-medium">Название</label>
            <input
              value={editingFormType.name}
              onChange={handleNameChange}
              className="w-full px-4 py-2 border rounded-lg bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder="Введите название типа формы"
              maxLength={255}
            />
            <p className="mt-1 text-xs text-[var(--color-gray)]">Максимум 255 символов</p>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-[var(--color-gray)]">
          <button
            onClick={() => setEditingFormType(null)}
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
            {editingFormType.id ? 'Сохранить изменения' : 'Добавить тип формы'}
          </button>
        </div>
      </div>
    </div>
  );
}