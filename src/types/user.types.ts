// src/types/user.types.ts

export interface User {
    id: number;
    email: string;
    phone?: string | null;
    role?: number | null;
    password_hash: string;
    created_at: Date;
  }