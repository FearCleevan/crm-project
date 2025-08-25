// src/utils/permissionMappings.js
export const NAVIGATION_PERMISSIONS = {
  DASHBOARD: ['dashboard_view'],
  CONTACTS: ['contacts_view'],
  ACCOUNTS: ['accounts_view'],
  DEALS: ['deals_view'],
  LEADS: ['leads_view'],
  CALENDAR: ['calendar_view'],
  EMAILS: ['email_view'],
  CALLS: ['calls_view'],
  TASKS: ['tasks_view'],
  PERMISSIONS: ['permissions_view'],
  USER_MANAGEMENT: ['users_view'],
  IP_MANAGEMENT: ['ip_management_view']  // Added IP Management
};

// Map permissions to module categories
export const MODULE_CATEGORIES = {
  CRM: ['dashboard_view', 'leads_view', 'contacts_view', 'accounts_view', 'deals_view'],
  ACTIVITIES: ['calendar_view', 'email_view', 'calls_view', 'tasks_view'],
  ACCOUNT_SETTINGS: ['users_view', 'permissions_view', 'ip_management_view']  // Added IP Management
};

// Check if user has access to a specific navigation item
export const hasAccessToNavigation = (userPermissions, navigationKey) => {
  const requiredPermissions = NAVIGATION_PERMISSIONS[navigationKey] || [];
  return requiredPermissions.length === 0 || 
         requiredPermissions.some(perm => userPermissions.includes(perm));
};

// Check if user has access to a module category
export const hasAccessToCategory = (userPermissions, category) => {
  const categoryPermissions = MODULE_CATEGORIES[category] || [];
  return categoryPermissions.length === 0 || 
         categoryPermissions.some(perm => userPermissions.includes(perm));
};