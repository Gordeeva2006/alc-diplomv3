export interface Packaging {
  id: number;
  name: string;
  material_id: number | null;
  material_name: string | null;
  volume: number;
  unit_id: number | null;
  unit_name: string | null;
  image: string | null;
  form_type_id: number | null;     // ✅ Добавлено
  form_type_name: string | null;   // ✅ Добавлено
}

export interface FormType {
  id: number;
  name: string;
}

export interface Material {
  id: number;
  name: string;
}

export interface Unit {
  id: number;
  name: string;
}