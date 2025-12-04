export const USER_ROLES = {
  TOURIST: "tourist",
  GUIDE: "guide",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];


export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.TOURIST]: "Can browse tours, book guides, and leave reviews",
  [USER_ROLES.GUIDE]: "Can create tour listings, accept bookings, and earn money",
  [USER_ROLES.ADMIN]: "Can manage users, listings, bookings, and system settings",
} as const;


export type Permission =
  | "view_listings"
  | "create_bookings"
  | "cancel_own_bookings"
  | "create_reviews"
  | "update_own_reviews"
  | "delete_own_reviews"
  | "view_own_profile"
  | "update_own_profile"
  | "create_listings"
  | "update_own_listings"
  | "delete_own_listings"
  | "view_bookings"
  | "accept_bookings"
  | "reject_bookings"
  | "complete_bookings"
  | "view_earnings"
  | "manage_users"
  | "manage_listings"
  | "manage_bookings"
  | "manage_payments"
  | "manage_reviews"
  | "view_analytics"
  | "view_system_health"
  | "generate_reports"
  | "bulk_operations"
  | "moderate_content";


export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  tourist: [
    "view_listings",
    "create_bookings",
    "cancel_own_bookings",
    "create_reviews",
    "update_own_reviews",
    "delete_own_reviews",
    "view_own_profile",
    "update_own_profile",
  ],

  guide: [
    "view_listings",
    "create_listings",
    "update_own_listings",
    "delete_own_listings",
    "view_bookings",
    "accept_bookings",
    "reject_bookings",
    "complete_bookings",
    "view_own_profile",
    "update_own_profile",
    "view_earnings",
  ],

  admin: [
    "manage_users",
    "manage_listings",
    "manage_bookings",
    "manage_payments",
    "manage_reviews",
    "view_analytics",
    "view_system_health",
    "generate_reports",
    "bulk_operations",
    "moderate_content",
  ],
};


export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role].includes(permission);
};


export const getRolePermissions = (role: UserRole): readonly Permission[] => {
  return ROLE_PERMISSIONS[role];
};


export const ROLE_PRIORITY = {
  tourist: 1,
  guide: 2,
  admin: 3,
} as const;

export const hasHigherPriority = (role1: UserRole, role2: UserRole): boolean => {
  return ROLE_PRIORITY[role1] > ROLE_PRIORITY[role2];
};
