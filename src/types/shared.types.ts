// src/types/shared.types.ts

export enum UserRole {
    USER = 1,
    ADMIN = 2,
  }
  
  export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }
  
  export enum ActionLogType {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    LOGIN = 'LOGIN',
    CONFIRM = 'CONFIRM',
    STATUS_CHANGE = 'STATUS_CHANGE',
    SETTINGS_UPDATE = 'SETTINGS_UPDATE'
  }