'use client';
import { Material } from '@/app/admin/packings/types';

interface Props {
  materials: Material[];
  setEditingMaterial: React.Dispatch<React.SetStateAction<Material | null>>;
  handleDeleteMaterial: (id: number) => void;
}

export default function MaterialTable({
  materials,
  setEditingMaterial,
  handleDeleteMaterial
}: Props) {
  return (
    <div className="mb-6 mt-6 overflow-x-auto">      
      <div className="bg-[var(--color-dark)] rounded-lg overflow-hidden shadow-md">
        <table className="min-w-full divide-y divide-[var(--color-gray)]">
          <thead className="bg-[var(--color-gray)]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Название</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-gray)]">
            {materials.map((material) => (
              <tr 
                key={material.id} 
                className="hover:bg-[var(--color-gray)] transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">{material.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{material.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button
                    onClick={() => setEditingMaterial(material)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
            
            {materials.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-[var(--color-gray)]">
                  <p className="text-lg mb-2">Материалы не найдены</p>
                  <p className="text-sm">Добавьте первый материал, чтобы начать работу</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}