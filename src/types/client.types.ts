// src/types/client.types.ts

export interface Client {
    id: number;
    user_id: number;
    type: 'individual' | 'legal_entity';
    phone?: string | null;
    legal_address: string;
    created_at: Date;
  }