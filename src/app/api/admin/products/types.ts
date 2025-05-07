export interface Product {
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
  
  export interface Packaging {
    id: number;
    name: string;
    image: string;
    material: number | null;
    unit: number | null;
    volume: number;
    material_name: string;
    unit_name: string;
  }
  
  export interface Category {
    id: number;
    name: string;
  }
  
  export interface FormType {
    id: number;
    name: string;
  }