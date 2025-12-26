import { Role } from '@/types/auth';

// Permission definitions matching backend
export enum Permission {
  // Dashboard permissions
  DASHBOARD_VIEW = 'dashboard:view',

  // Marka permissions
  MARKA_VIEW = 'marka:view',
  MARKA_CREATE = 'marka:create',
  MARKA_UPDATE = 'marka:update',
  MARKA_DELETE = 'marka:delete',
  MARKA_TOGGLE_SCALE = 'marka:toggle_scale',
  MARKA_STATS = 'marka:stats',

  // Toy permissions
  TOY_VIEW = 'toy:view',
  TOY_CREATE = 'toy:create',
  TOY_UPDATE = 'toy:update',
  TOY_DELETE = 'toy:delete',
  TOY_PRINT = 'toy:print',
  TOY_QR_GENERATE = 'toy:qr_generate',

  // Laboratory permissions
  LAB_VIEW = 'lab:view',
  LAB_CREATE_SAMPLE = 'lab:create_sample',
  LAB_UPDATE_SAMPLE = 'lab:update_sample',
  LAB_APPROVE = 'lab:approve',
  LAB_REJECT = 'lab:reject',
  LAB_STATS = 'lab:stats',
  LAB_BULK_OPERATIONS = 'lab:bulk_operations',

  // Scale permissions
  SCALE_VIEW = 'scale:view',
  SCALE_OPERATE = 'scale:operate',
  SCALE_CONFIG = 'scale:config',
  SCALE_READINGS = 'scale:readings',

  // Customer permissions
  CUSTOMER_VIEW = 'customer:view',
  CUSTOMER_CREATE = 'customer:create',
  CUSTOMER_UPDATE = 'customer:update',
  CUSTOMER_DELETE = 'customer:delete',
  CUSTOMER_STATS = 'customer:stats',

  // Warehouse permissions
  WAREHOUSE_VIEW = 'warehouse:view',
  WAREHOUSE_CREATE_ORDER = 'warehouse:create_order',
  WAREHOUSE_UPDATE_ORDER = 'warehouse:update_order',
  WAREHOUSE_DELETE_ORDER = 'warehouse:delete_order',
  WAREHOUSE_CHECKLIST = 'warehouse:checklist',
  WAREHOUSE_SHIPMENT = 'warehouse:shipment',
  WAREHOUSE_SCAN = 'warehouse:scan',
  WAREHOUSE_STATS = 'warehouse:stats',

  // Production permissions
  PRODUCTION_VIEW = 'production:view',
  PRODUCTION_MANAGE = 'production:manage',
  PRODUCTION_STATS = 'production:stats',
  PRODUCTION_REPORTS = 'production:reports',

  // Reports permissions
  REPORTS_VIEW = 'reports:view',
  REPORTS_EXPORT = 'reports:export',
  REPORTS_ADVANCED = 'reports:advanced',

  // Admin permissions
  ADMIN_USERS = 'admin:users',
  ADMIN_AUDIT = 'admin:audit',
  ADMIN_SYSTEM = 'admin:system',
  ADMIN_STATS = 'admin:stats',
  ADMIN_SETTINGS = 'admin:settings',

  // Settings permissions
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_UPDATE_PROFILE = 'settings:update_profile',
  SETTINGS_CHANGE_PASSWORD = 'settings:change_password',
  SETTINGS_NOTIFICATIONS = 'settings:notifications',
}

// Role to Permissions mapping (matches backend)
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.DASHBOARD_VIEW,
    Permission.MARKA_VIEW, Permission.MARKA_CREATE, Permission.MARKA_UPDATE, Permission.MARKA_DELETE, Permission.MARKA_TOGGLE_SCALE, Permission.MARKA_STATS,
    Permission.TOY_VIEW, Permission.TOY_CREATE, Permission.TOY_UPDATE, Permission.TOY_DELETE, Permission.TOY_PRINT, Permission.TOY_QR_GENERATE,
    Permission.LAB_VIEW, Permission.LAB_CREATE_SAMPLE, Permission.LAB_UPDATE_SAMPLE, Permission.LAB_APPROVE, Permission.LAB_REJECT, Permission.LAB_STATS, Permission.LAB_BULK_OPERATIONS,
    Permission.SCALE_VIEW, Permission.SCALE_OPERATE, Permission.SCALE_CONFIG, Permission.SCALE_READINGS,
    Permission.CUSTOMER_VIEW, Permission.CUSTOMER_CREATE, Permission.CUSTOMER_UPDATE, Permission.CUSTOMER_DELETE, Permission.CUSTOMER_STATS,
    Permission.WAREHOUSE_VIEW, Permission.WAREHOUSE_CREATE_ORDER, Permission.WAREHOUSE_UPDATE_ORDER, Permission.WAREHOUSE_DELETE_ORDER, Permission.WAREHOUSE_CHECKLIST, Permission.WAREHOUSE_SHIPMENT, Permission.WAREHOUSE_SCAN, Permission.WAREHOUSE_STATS,
    Permission.PRODUCTION_VIEW, Permission.PRODUCTION_MANAGE, Permission.PRODUCTION_STATS, Permission.PRODUCTION_REPORTS,
    Permission.REPORTS_VIEW, Permission.REPORTS_EXPORT, Permission.REPORTS_ADVANCED,
    Permission.ADMIN_USERS, Permission.ADMIN_AUDIT, Permission.ADMIN_SYSTEM, Permission.ADMIN_STATS, Permission.ADMIN_SETTINGS,
    Permission.SETTINGS_VIEW, Permission.SETTINGS_UPDATE_PROFILE, Permission.SETTINGS_CHANGE_PASSWORD, Permission.SETTINGS_NOTIFICATIONS,
  ],

  [Role.OPERATOR]: [
    Permission.DASHBOARD_VIEW,
    Permission.SCALE_VIEW, Permission.SCALE_OPERATE, Permission.SCALE_READINGS,
    Permission.TOY_VIEW, Permission.TOY_CREATE, Permission.TOY_QR_GENERATE,
    Permission.SETTINGS_VIEW, Permission.SETTINGS_UPDATE_PROFILE, Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  [Role.LAB_ANALYST]: [
    Permission.DASHBOARD_VIEW,
    Permission.MARKA_VIEW, Permission.MARKA_CREATE, Permission.MARKA_UPDATE, Permission.MARKA_DELETE, Permission.MARKA_STATS,
    Permission.TOY_VIEW,
    Permission.LAB_VIEW, Permission.LAB_CREATE_SAMPLE, Permission.LAB_UPDATE_SAMPLE, Permission.LAB_APPROVE, Permission.LAB_REJECT, Permission.LAB_STATS, Permission.LAB_BULK_OPERATIONS,
    Permission.REPORTS_VIEW, Permission.REPORTS_EXPORT,
    Permission.SETTINGS_VIEW, Permission.SETTINGS_UPDATE_PROFILE, Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  [Role.WAREHOUSE_MANAGER]: [
    Permission.DASHBOARD_VIEW,
    Permission.TOY_VIEW, Permission.MARKA_VIEW, Permission.CUSTOMER_VIEW,
    Permission.WAREHOUSE_VIEW, Permission.WAREHOUSE_CREATE_ORDER, Permission.WAREHOUSE_UPDATE_ORDER, Permission.WAREHOUSE_DELETE_ORDER, Permission.WAREHOUSE_CHECKLIST, Permission.WAREHOUSE_SHIPMENT, Permission.WAREHOUSE_SCAN, Permission.WAREHOUSE_STATS,
    Permission.REPORTS_VIEW, Permission.REPORTS_EXPORT,
    Permission.SETTINGS_VIEW, Permission.SETTINGS_UPDATE_PROFILE, Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  [Role.PRODUCTION_MANAGER]: [
    Permission.DASHBOARD_VIEW,
    Permission.MARKA_VIEW, Permission.TOY_VIEW,
    Permission.PRODUCTION_VIEW, Permission.PRODUCTION_MANAGE, Permission.PRODUCTION_STATS, Permission.PRODUCTION_REPORTS,
    Permission.REPORTS_VIEW, Permission.REPORTS_EXPORT, Permission.REPORTS_ADVANCED,
    Permission.SETTINGS_VIEW, Permission.SETTINGS_UPDATE_PROFILE, Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  [Role.CUSTOMER_MANAGER]: [
    Permission.DASHBOARD_VIEW,
    Permission.CUSTOMER_VIEW, Permission.CUSTOMER_CREATE, Permission.CUSTOMER_UPDATE, Permission.CUSTOMER_DELETE, Permission.CUSTOMER_STATS,
    Permission.WAREHOUSE_VIEW, Permission.WAREHOUSE_CREATE_ORDER,
    Permission.TOY_VIEW, Permission.MARKA_VIEW,
    Permission.REPORTS_VIEW, Permission.REPORTS_EXPORT,
    Permission.SETTINGS_VIEW, Permission.SETTINGS_UPDATE_PROFILE, Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  [Role.SALES_MANAGER]: [
    Permission.DASHBOARD_VIEW,
    Permission.CUSTOMER_VIEW, Permission.CUSTOMER_CREATE, Permission.CUSTOMER_UPDATE, Permission.CUSTOMER_STATS,
    Permission.TOY_VIEW, Permission.MARKA_VIEW, Permission.WAREHOUSE_VIEW, Permission.WAREHOUSE_CREATE_ORDER,
    Permission.REPORTS_VIEW, Permission.REPORTS_EXPORT, Permission.REPORTS_ADVANCED,
    Permission.SETTINGS_VIEW, Permission.SETTINGS_UPDATE_PROFILE, Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  [Role.ACCOUNTANT]: [
    Permission.DASHBOARD_VIEW,
    Permission.CUSTOMER_VIEW, Permission.TOY_VIEW, Permission.MARKA_VIEW, Permission.WAREHOUSE_VIEW,
    Permission.REPORTS_VIEW, Permission.REPORTS_EXPORT, Permission.REPORTS_ADVANCED,
    Permission.SETTINGS_VIEW, Permission.SETTINGS_UPDATE_PROFILE, Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  [Role.SUPERVISOR]: [
    Permission.DASHBOARD_VIEW,
    Permission.MARKA_VIEW, Permission.TOY_VIEW, Permission.LAB_VIEW, Permission.SCALE_VIEW, Permission.CUSTOMER_VIEW, Permission.WAREHOUSE_VIEW, Permission.PRODUCTION_VIEW,
    Permission.MARKA_STATS, Permission.LAB_STATS, Permission.WAREHOUSE_STATS, Permission.PRODUCTION_STATS, Permission.CUSTOMER_STATS,
    Permission.REPORTS_VIEW, Permission.REPORTS_EXPORT, Permission.REPORTS_ADVANCED,
    Permission.SETTINGS_VIEW, Permission.SETTINGS_UPDATE_PROFILE, Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  [Role.SCALE]: [
    Permission.DASHBOARD_VIEW,
    Permission.SCALE_VIEW, Permission.SCALE_OPERATE, Permission.SCALE_READINGS,
    Permission.TOY_VIEW, Permission.TOY_CREATE, Permission.TOY_QR_GENERATE,
    Permission.SETTINGS_VIEW, Permission.SETTINGS_UPDATE_PROFILE, Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  [Role.LAB]: [
    Permission.DASHBOARD_VIEW,
    Permission.MARKA_VIEW, Permission.MARKA_CREATE, Permission.MARKA_UPDATE, Permission.MARKA_DELETE, Permission.MARKA_STATS,
    Permission.TOY_VIEW,
    Permission.LAB_VIEW, Permission.LAB_CREATE_SAMPLE, Permission.LAB_UPDATE_SAMPLE, Permission.LAB_APPROVE, Permission.LAB_REJECT, Permission.LAB_STATS, Permission.LAB_BULK_OPERATIONS,
    Permission.REPORTS_VIEW, Permission.REPORTS_EXPORT,
    Permission.SETTINGS_VIEW, Permission.SETTINGS_UPDATE_PROFILE, Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  [Role.WAREHOUSE]: [
    Permission.DASHBOARD_VIEW,
    Permission.TOY_VIEW, Permission.MARKA_VIEW, Permission.CUSTOMER_VIEW,
    Permission.WAREHOUSE_VIEW, Permission.WAREHOUSE_CREATE_ORDER, Permission.WAREHOUSE_UPDATE_ORDER, Permission.WAREHOUSE_DELETE_ORDER, Permission.WAREHOUSE_CHECKLIST, Permission.WAREHOUSE_SHIPMENT, Permission.WAREHOUSE_SCAN, Permission.WAREHOUSE_STATS,
    Permission.REPORTS_VIEW, Permission.REPORTS_EXPORT,
    Permission.SETTINGS_VIEW, Permission.SETTINGS_UPDATE_PROFILE, Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  [Role.SALES]: [
    Permission.DASHBOARD_VIEW,
    Permission.CUSTOMER_VIEW, Permission.CUSTOMER_CREATE, Permission.CUSTOMER_UPDATE, Permission.CUSTOMER_STATS,
    Permission.TOY_VIEW, Permission.MARKA_VIEW, Permission.WAREHOUSE_VIEW, Permission.WAREHOUSE_CREATE_ORDER,
    Permission.REPORTS_VIEW, Permission.REPORTS_EXPORT, Permission.REPORTS_ADVANCED,
    Permission.SETTINGS_VIEW, Permission.SETTINGS_UPDATE_PROFILE, Permission.SETTINGS_CHANGE_PASSWORD,
  ],
};

// Helper functions
export function hasPermission(userRole: Role, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function filterPermittedItems<T extends { permissions?: Permission[] }>(
  items: T[],
  userRole: Role
): T[] {
  return items.filter(item => {
    if (!item.permissions || item.permissions.length === 0) {
      return true; // No permissions required
    }
    return hasAnyPermission(userRole, item.permissions);
  });
}