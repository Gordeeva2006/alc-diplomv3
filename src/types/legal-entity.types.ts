// src/types/legal-entity.types.ts

export interface LegalEntity {
    id: number;
    client_id: number;
    company_name?: string | null;
    inn?: string | null;
    kpp?: string | null;
    ogrn?: string | null;
  }