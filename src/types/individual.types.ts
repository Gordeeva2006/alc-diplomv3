// src/types/individual.types.ts

export interface Individual {
    id: number;
    client_id: number;
    company_name?: string | null;
    inn?: string | null;
    ogrnip?: string | null;
  }