'use client';
import { useEffect, useState, useRef } from 'react';
import PackagingTable from './components/PackagingTable';
import PackagingModal from './components/PackagingModal';
import MaterialTable from './components/MaterialTable';
import MaterialModal from './components/MaterialModal';
import UnitTable from './components/UnitTable';
import UnitModal from './components/UnitModal';
import FormTypeTable from './components/FormTypeTable';
import FormTypeModal from './components/FormTypeModal';
import { Packaging, FormType, Material, Unit } from './types';
import AdminHeader from '../AdminHeader';

export default function PackingsPage() {
  // Состояния
  const [packagings, setPackagings] = useState<Packaging[]>([]);
  const [formTypes, setFormTypes] = useState<FormType[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [editingPacking, setEditingPacking] = useState<Packaging | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editingFormType, setEditingFormType] = useState<FormType | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Исправленный ref - теперь он может быть null
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Загрузка данных
  useEffect(() => {
    fetchData();
    fetchFormTypes();
    fetchMaterials();
    fetchUnits();
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
      const res = await fetch('/api/admin/apiformtypes');
      const data = await res.json();
      setFormTypes(data);
    } catch (err) {
      console.error('Ошибка загрузки типов форм:', err);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/admin/materials');
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      console.error('Ошибка загрузки материалов:', err);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await fetch('/api/admin/units');
      const data = await res.json();
      setUnits(data);
    } catch (err) {
      console.error('Ошибка загрузки единиц измерения:', err);
    }
  };

  // Обработка изображения
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = 'dataTransfer' in e ? e.dataTransfer.files : e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Проверка формата файла
      if (!file.type.startsWith('image/')) {
        alert('Загрузите изображение в формате JPG, PNG или SVG');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Валидация данных перед сохранением
  const validatePacking = () => {
    if (!editingPacking) return false;
    if (!editingPacking.name.trim()) {
      alert('Введите название упаковки');
      return false;
    }
    if (!editingPacking.material_id) {
      alert('Выберите материал');
      return false;
    }
    if (!editingPacking.unit_id) {
      alert('Выберите единицу измерения');
      return false;
    }
    if (editingPacking.volume <= 0) {
      alert('Объем должен быть больше нуля');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!editingPacking || !validatePacking()) return;
    try {
      // Проверка существования связанных сущностей
      const isValid = 
        materials.some(m => m.id === editingPacking.material_id) &&
        units.some(u => u.id === editingPacking.unit_id) &&
        (!editingPacking.form_type_id || formTypes.some(ft => ft.id === editingPacking.form_type_id));
      if (!isValid) {
        alert('Выбранные материал, единица измерения или тип формы недействительны');
        return;
      }
      const method = editingPacking?.id ? 'PUT' : 'POST';
      const url = editingPacking?.id 
        ? `/api/admin/packings?id=${editingPacking.id}` 
        : '/api/admin/packings';
      const formData = new FormData();
      formData.append('name', editingPacking.name);
      formData.append('material', editingPacking.material_id?.toString() || '');
      formData.append('volume', editingPacking.volume.toString());
      formData.append('unit', editingPacking.unit_id?.toString() || '');
      if (editingPacking.form_type_id) {
        formData.append('form_type', editingPacking.form_type_id.toString());
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }
      const res = await fetch(url, {
        method,
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Ошибка сохранения');
      }
      fetchData();
      setEditingPacking(null);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Ошибка сохранения упаковки:', error);
      alert('Не удалось сохранить упаковку. Пожалуйста, попробуйте снова.');
    }
  };

  // Сброс изображения при закрытии модального окна
  useEffect(() => {
    if (!editingPacking) {
      setImagePreview(null);
      setImageFile(null);
    }
  }, [editingPacking]);

  // Удаление упаковки
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту упаковку?')) return;
    try {
      const res = await fetch(`/api/admin/packings?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Ошибка удаления');
      }
      fetchData();
    } catch (error) {
      console.error('Ошибка удаления упаковки:', error);
      alert('Не удалось удалить упаковку. Пожалуйста, попробуйте снова.');
    }
  };

  // Обновление состояния при выборе материала
  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value ? Number(e.target.value) : null;
    const selectedMaterial = materials.find(m => m.id === selectedId);
    setEditingPacking({
      ...editingPacking!,
      material_id: selectedId,
      material_name: selectedMaterial?.name || ''
    });
  };

  // Обновление состояния при выборе единицы
  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value ? Number(e.target.value) : null;
    const selectedUnit = units.find(u => u.id === selectedId);
    setEditingPacking({
      ...editingPacking!,
      unit_id: selectedId,
      unit_name: selectedUnit?.name || ''
    });
  };

  // Обновление состояния при выборе типа формы
  const handleFormTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value ? Number(e.target.value) : null;
    const selectedFormType = formTypes.find(ft => ft.id === selectedId);
    setEditingPacking({
      ...editingPacking!,
      form_type_id: selectedId,
      form_type_name: selectedFormType?.name || ''
    });
  };

  // CRUD для материалов
  const handleSaveMaterial = async () => {
    if (!editingMaterial) return;
    try {
      const method = editingMaterial.id ? 'PUT' : 'POST';
      const url = editingMaterial.id 
        ? `/api/admin/materials?id=${editingMaterial.id}` 
        : '/api/admin/materials';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingMaterial.name })
      });
      if (!res.ok) throw new Error('Ошибка сохранения материала');
      fetchMaterials();
      setEditingMaterial(null);
    } catch (error) {
      console.error('Ошибка сохранения материала:', error);
      alert('Не удалось сохранить материал. Пожалуйста, попробуйте снова.');
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm('Удалить материал?')) return;
    try {
      const res = await fetch(`/api/admin/materials?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Ошибка удаления материала');
      fetchMaterials();
    } catch (error) {
      console.error('Ошибка удаления материала:', error);
      alert('Не удалось удалить материал. Пожалуйста, попробуйте снова.');
    }
  };

  // CRUD для единиц измерения
  const handleSaveUnit = async () => {
    if (!editingUnit) return;
    try {
      const method = editingUnit.id ? 'PUT' : 'POST';
      const url = editingUnit.id 
        ? `/api/admin/units?id=${editingUnit.id}` 
        : '/api/admin/units';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingUnit.name })
      });
      if (!res.ok) throw new Error('Ошибка сохранения единицы');
      fetchUnits();
      setEditingUnit(null);
    } catch (error) {
      console.error('Ошибка сохранения единицы:', error);
      alert('Не удалось сохранить единицу. Пожалуйста, попробуйте снова.');
    }
  };

  const handleDeleteUnit = async (id: number) => {
    if (!confirm('Удалить единицу?')) return;
    try {
      const res = await fetch(`/api/admin/units?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Ошибка удаления единицы');
      fetchUnits();
    } catch (error) {
      console.error('Ошибка удаления единицы:', error);
      alert('Не удалось удалить единицу. Пожалуйста, попробуйте снова.');
    }
  };

  // CRUD для типов форм
  const handleSaveFormType = async () => {
    if (!editingFormType) return;
    try {
      const method = editingFormType.id ? 'PUT' : 'POST';
      const url = editingFormType.id 
        ? `/api/admin/apiformtypes?id=${editingFormType.id}` 
        : '/api/admin/apiformtypes';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingFormType.name })
      });
      if (!res.ok) throw new Error('Ошибка сохранения типа формы');
      fetchFormTypes();
      setEditingFormType(null);
    } catch (error) {
      console.error('Ошибка сохранения типа формы:', error);
      alert('Не удалось сохранить тип формы. Пожалуйста, попробуйте снова.');
    }
  };

  const handleDeleteFormType = async (id: number) => {
    if (!confirm('Удалить тип формы?')) return;
    try {
      const res = await fetch(`/api/admin/apiformtypes?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Ошибка удаления типа формы');
      fetchFormTypes();
    } catch (error) {
      console.error('Ошибка удаления типа формы:', error);
      alert('Не удалось удалить тип формы. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <div className="bg-[var(--color-dark)] text-white min-h-screen flex flex-col">
      {/* Header */}
      <AdminHeader />
      {/* Основной контент */}
      <main className="flex-grow p-6">
        <div className="max-w-9xl mx-auto py-12 px-4 min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Управление упаковками</h2>
            <button 
              onClick={() => setEditingPacking({
                id: 0,
                name: '',
                material_id: null,
                material_name: '',
                volume: 0,
                unit_id: null,
                unit_name: '',
                image: '',
                form_type_id: null,
                form_type_name: ''
              })} 
              className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded mb-4"
            >
              Добавить упаковку
            </button>
          </div>
          {/* Основная таблица упаковок */}
          <PackagingTable 
            packagings={packagings}
            handleDelete={handleDelete}
            setEditingPacking={setEditingPacking}
            setImagePreview={setImagePreview}
          />
          {/* Модальное окно для упаковок */}
          <PackagingModal
              editingPacking={editingPacking}
              materials={materials}
              units={units}
              formTypes={formTypes}
              imagePreview={imagePreview}
              handleMaterialChange={handleMaterialChange}
              handleUnitChange={handleUnitChange}
              handleFormTypeChange={handleFormTypeChange} 
              handleImageUpload={handleImageUpload}
              handleButtonClick={handleButtonClick}
              handleSave={handleSave}
              setEditingPacking={setEditingPacking}
              setImagePreview={setImagePreview}
              fileInputRef={fileInputRef}
            />
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Материалы</h2>
            <button
              onClick={() => setEditingMaterial({ id: 0, name: '' })}
              className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded hover:opacity-90 transition-opacity"
            >
              Добавить материал
            </button>
          </div>
          {/* Управление материалами */}
          <MaterialTable
            materials={materials}
            setEditingMaterial={setEditingMaterial}
            handleDeleteMaterial={handleDeleteMaterial}
          />
          {/* Модальное окно для материалов */}
          <MaterialModal
            editingMaterial={editingMaterial}
            setEditingMaterial={setEditingMaterial}
            handleSaveMaterial={handleSaveMaterial}
          />
          {/* Управление единицами измерения */}
          <UnitTable
            units={units}
            setEditingUnit={setEditingUnit}
            handleDeleteUnit={handleDeleteUnit}
          />
          {/* Модальное окно для единиц измерения */}
          <UnitModal
            editingUnit={editingUnit}
            setEditingUnit={setEditingUnit}
            handleSaveUnit={handleSaveUnit}
          />
          {/* Управление типами форм */}
          <FormTypeTable
            formTypes={formTypes}
            setEditingFormType={setEditingFormType}
            handleDeleteFormType={handleDeleteFormType}
          />
          {/* Модальное окно для типов форм */}
          <FormTypeModal
            editingFormType={editingFormType}
            setEditingFormType={setEditingFormType}
            handleSaveFormType={handleSaveFormType}
          />
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-[var(--color-dark)] border-t border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} Панель управления упаковками. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}