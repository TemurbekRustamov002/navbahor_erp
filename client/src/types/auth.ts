// Authentication and Authorization Types
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  // Optional department for access scoping (e.g., ARRALI_SEX, VALIKLI_SEX)
  department?: 'ARRALI_SEX' | 'VALIKLI_SEX' | 'UNIVERSAL';
}

export enum Role {
  ADMIN = 'ADMIN',
  SCALE = 'SCALE',
  LAB = 'LAB',
  WAREHOUSE = 'WAREHOUSE',
  SUPERVISOR = 'SUPERVISOR',
  SALES = 'SALES',
  OPERATOR = 'OPERATOR',
  LAB_ANALYST = 'LAB_ANALYST',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  PRODUCTION_MANAGER = 'PRODUCTION_MANAGER',
  CUSTOMER_MANAGER = 'CUSTOMER_MANAGER',
  SALES_MANAGER = 'SALES_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT'
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthPermissions {
  role: Role;
  permissions: string[];
}

// Permission-based navigation items
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: any; // Lucide icon component
  permissions: string[];
  children?: NavigationItem[];
}

// Role-based user credentials for demo/testing - Matches Backend Seed Data Exact
export const DEMO_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    fullName: 'Bosh Administrator',
    role: Role.ADMIN,
    description: 'Barcha ruxsatlarga ega',
  },
  {
    username: 'tarozi',
    password: 'tarozi123',
    fullName: 'Tarozi Operator',
    role: Role.SCALE,
    description: 'Tarozi terminali boshqaruvi',
  },
  {
    username: 'laborant',
    password: 'lab123',
    fullName: 'Laborant Analitigi',
    role: Role.LAB,
    description: 'Sifat tahlili va laboratoriya',
  },
  {
    username: 'ombor',
    password: 'ombor123',
    fullName: 'Ombor Mudiri',
    role: Role.WAREHOUSE,
    description: 'Tayyor mahsulot va chiqim nazorati',
  }
] as const;