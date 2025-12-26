// Role-based Permissions for ERP System
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

// Role to Permissions mapping
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    // Dashboard
    Permission.DASHBOARD_VIEW,
    
    // All Marka permissions
    Permission.MARKA_VIEW,
    Permission.MARKA_CREATE,
    Permission.MARKA_UPDATE,
    Permission.MARKA_DELETE,
    Permission.MARKA_TOGGLE_SCALE,
    Permission.MARKA_STATS,
    
    // All Toy permissions
    Permission.TOY_VIEW,
    Permission.TOY_CREATE,
    Permission.TOY_UPDATE,
    Permission.TOY_DELETE,
    Permission.TOY_PRINT,
    Permission.TOY_QR_GENERATE,
    
    // All Lab permissions
    Permission.LAB_VIEW,
    Permission.LAB_CREATE_SAMPLE,
    Permission.LAB_UPDATE_SAMPLE,
    Permission.LAB_APPROVE,
    Permission.LAB_REJECT,
    Permission.LAB_STATS,
    Permission.LAB_BULK_OPERATIONS,
    
    // All Scale permissions
    Permission.SCALE_VIEW,
    Permission.SCALE_OPERATE,
    Permission.SCALE_CONFIG,
    Permission.SCALE_READINGS,
    
    // All Customer permissions
    Permission.CUSTOMER_VIEW,
    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_UPDATE,
    Permission.CUSTOMER_DELETE,
    Permission.CUSTOMER_STATS,
    
    // All Warehouse permissions
    Permission.WAREHOUSE_VIEW,
    Permission.WAREHOUSE_CREATE_ORDER,
    Permission.WAREHOUSE_UPDATE_ORDER,
    Permission.WAREHOUSE_DELETE_ORDER,
    Permission.WAREHOUSE_CHECKLIST,
    Permission.WAREHOUSE_SHIPMENT,
    Permission.WAREHOUSE_SCAN,
    Permission.WAREHOUSE_STATS,
    
    // All Production permissions
    Permission.PRODUCTION_VIEW,
    Permission.PRODUCTION_MANAGE,
    Permission.PRODUCTION_STATS,
    Permission.PRODUCTION_REPORTS,
    
    // All Reports permissions
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    Permission.REPORTS_ADVANCED,
    
    // All Admin permissions
    Permission.ADMIN_USERS,
    Permission.ADMIN_AUDIT,
    Permission.ADMIN_SYSTEM,
    Permission.ADMIN_STATS,
    Permission.ADMIN_SETTINGS,
    
    // All Settings permissions
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE_PROFILE,
    Permission.SETTINGS_CHANGE_PASSWORD,
    Permission.SETTINGS_NOTIFICATIONS,
  ],

  OPERATOR: [
    // Dashboard
    Permission.DASHBOARD_VIEW,
    
    // Scale operations
    Permission.SCALE_VIEW,
    Permission.SCALE_OPERATE,
    Permission.SCALE_READINGS,
    
    // Toy operations for scale
    Permission.TOY_VIEW,
    Permission.TOY_CREATE,
    Permission.TOY_QR_GENERATE,
    
    // Basic settings
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE_PROFILE,
    Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  LAB_ANALYST: [
    // Dashboard
    Permission.DASHBOARD_VIEW,
    
    // Marka permissions (Lab analysts manage markas)
    Permission.MARKA_VIEW,
    Permission.MARKA_CREATE,
    Permission.MARKA_UPDATE,
    Permission.MARKA_DELETE,
    Permission.MARKA_STATS,
    
    // Toy view for lab analysis
    Permission.TOY_VIEW,
    
    // Full Lab permissions
    Permission.LAB_VIEW,
    Permission.LAB_CREATE_SAMPLE,
    Permission.LAB_UPDATE_SAMPLE,
    Permission.LAB_APPROVE,
    Permission.LAB_REJECT,
    Permission.LAB_STATS,
    Permission.LAB_BULK_OPERATIONS,
    
    // Reports for lab
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    
    // Basic settings
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE_PROFILE,
    Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  WAREHOUSE_MANAGER: [
    // Dashboard
    Permission.DASHBOARD_VIEW,
    
    // View toys and markas for warehouse operations
    Permission.TOY_VIEW,
    Permission.MARKA_VIEW,
    
    // Customer info for orders
    Permission.CUSTOMER_VIEW,
    
    // Full Warehouse permissions
    Permission.WAREHOUSE_VIEW,
    Permission.WAREHOUSE_CREATE_ORDER,
    Permission.WAREHOUSE_UPDATE_ORDER,
    Permission.WAREHOUSE_DELETE_ORDER,
    Permission.WAREHOUSE_CHECKLIST,
    Permission.WAREHOUSE_SHIPMENT,
    Permission.WAREHOUSE_SCAN,
    Permission.WAREHOUSE_STATS,
    
    // Reports
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    
    // Basic settings
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE_PROFILE,
    Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  PRODUCTION_MANAGER: [
    // Dashboard
    Permission.DASHBOARD_VIEW,
    
    // View markas and toys for production planning
    Permission.MARKA_VIEW,
    Permission.TOY_VIEW,
    
    // Full Production permissions
    Permission.PRODUCTION_VIEW,
    Permission.PRODUCTION_MANAGE,
    Permission.PRODUCTION_STATS,
    Permission.PRODUCTION_REPORTS,
    
    // Reports
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    Permission.REPORTS_ADVANCED,
    
    // Basic settings
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE_PROFILE,
    Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  CUSTOMER_MANAGER: [
    // Dashboard
    Permission.DASHBOARD_VIEW,
    
    // Full Customer permissions
    Permission.CUSTOMER_VIEW,
    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_UPDATE,
    Permission.CUSTOMER_DELETE,
    Permission.CUSTOMER_STATS,
    
    // View warehouse for customer orders
    Permission.WAREHOUSE_VIEW,
    Permission.WAREHOUSE_CREATE_ORDER,
    
    // View products for customer needs
    Permission.TOY_VIEW,
    Permission.MARKA_VIEW,
    
    // Reports
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    
    // Basic settings
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE_PROFILE,
    Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  SALES_MANAGER: [
    // Dashboard
    Permission.DASHBOARD_VIEW,
    
    // Customer management for sales
    Permission.CUSTOMER_VIEW,
    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_UPDATE,
    Permission.CUSTOMER_STATS,
    
    // View products and warehouse for sales
    Permission.TOY_VIEW,
    Permission.MARKA_VIEW,
    Permission.WAREHOUSE_VIEW,
    Permission.WAREHOUSE_CREATE_ORDER,
    
    // Reports for sales analytics
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    Permission.REPORTS_ADVANCED,
    
    // Basic settings
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE_PROFILE,
    Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  ACCOUNTANT: [
    // Dashboard
    Permission.DASHBOARD_VIEW,
    
    // View permissions for accounting
    Permission.CUSTOMER_VIEW,
    Permission.TOY_VIEW,
    Permission.MARKA_VIEW,
    Permission.WAREHOUSE_VIEW,
    
    // Full Reports access for accounting
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    Permission.REPORTS_ADVANCED,
    
    // Basic settings
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE_PROFILE,
    Permission.SETTINGS_CHANGE_PASSWORD,
  ],

  SUPERVISOR: [
    // Dashboard
    Permission.DASHBOARD_VIEW,
    
    // View all modules for supervision
    Permission.MARKA_VIEW,
    Permission.TOY_VIEW,
    Permission.LAB_VIEW,
    Permission.SCALE_VIEW,
    Permission.CUSTOMER_VIEW,
    Permission.WAREHOUSE_VIEW,
    Permission.PRODUCTION_VIEW,
    
    // Stats permissions for monitoring
    Permission.MARKA_STATS,
    Permission.LAB_STATS,
    Permission.WAREHOUSE_STATS,
    Permission.PRODUCTION_STATS,
    Permission.CUSTOMER_STATS,
    
    // Reports
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    Permission.REPORTS_ADVANCED,
    
    // Basic settings
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE_PROFILE,
    Permission.SETTINGS_CHANGE_PASSWORD,
  ],
};

// Helper function to check if user has permission
export function hasPermission(userRole: string, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

// Helper function to get all permissions for a role
export function getRolePermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}