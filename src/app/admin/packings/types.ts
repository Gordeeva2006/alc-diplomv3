// src/app/admin/packings/types.ts
export interface Packaging {
    id: number;
    name: string;
    material_id: number | null;
    material_name: string | null;
    volume: number;
    unit_id: number | null;
    unit_name: string | null;
    image: string | null;
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