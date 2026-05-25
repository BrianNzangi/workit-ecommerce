export const adminRoles = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;
export type AdminRole = (typeof adminRoles)[number];
export const customerRole = "CUSTOMER" as const;
export type UserRole = AdminRole | typeof customerRole;
export const ROLE_PERMISSIONS_SETTING_KEY = "rbac.role_permissions";

export const permissions = [
    "analytics.view",
    "catalog.manage",
    "customers.manage",
    "marketing.content.manage",
    "orders.manage",
    "settings.manage",
    "shipping.manage",
    "users.manage",
] as const;

export type Permission = (typeof permissions)[number];
export type RolePermissionsMap = Record<AdminRole, Permission[]>;

const roleRank: Record<AdminRole, number> = {
    EDITOR: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
};

export const defaultRolePermissions: RolePermissionsMap = {
    SUPER_ADMIN: [...permissions],
    ADMIN: [
        "analytics.view",
        "catalog.manage",
        "customers.manage",
        "marketing.content.manage",
        "orders.manage",
        "shipping.manage",
    ],
    EDITOR: [
        "analytics.view",
        "catalog.manage",
        "marketing.content.manage",
    ],
};

export const rolePermissions = defaultRolePermissions;

const isPermission = (value: unknown): value is Permission =>
    typeof value === "string" && (permissions as readonly string[]).includes(value);

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const normalizePermissionList = (value: unknown): Permission[] | null => {
    if (!Array.isArray(value)) return null;
    const filtered = value.filter(isPermission);
    return Array.from(new Set(filtered));
};

export const sanitizeRolePermissionsConfig = (value: unknown): RolePermissionsMap => {
    const raw = isObjectRecord(value) ? value : {};
    return {
        SUPER_ADMIN: [...permissions],
        ADMIN: normalizePermissionList(raw.ADMIN) ?? [...defaultRolePermissions.ADMIN],
        EDITOR: normalizePermissionList(raw.EDITOR) ?? [...defaultRolePermissions.EDITOR],
    };
};

export const normalizeAdminRole = (role: unknown): AdminRole | null => {
    if (typeof role !== "string") return null;
    const normalized = role.toUpperCase();
    return (adminRoles as readonly string[]).includes(normalized)
        ? (normalized as AdminRole)
        : null;
};

export const hasRoleAccess = (
    currentRole: unknown,
    requiredRoles: readonly AdminRole[],
): boolean => {
    const normalizedRole = normalizeAdminRole(currentRole);
    if (!normalizedRole) return false;

    const currentRank = roleRank[normalizedRole];
    return requiredRoles.some((requiredRole) => currentRank >= roleRank[requiredRole]);
};

export const getPermissionsForRole = (role: unknown): Permission[] => {
    const normalizedRole = normalizeAdminRole(role);
    if (!normalizedRole) return [];
    return rolePermissions[normalizedRole];
};

export const hasPermission = (
    role: unknown,
    requiredPermission: Permission,
): boolean => {
    return getPermissionsForRole(role).includes(requiredPermission);
};

export const hasAnyPermission = (
    role: unknown,
    requiredPermissions: readonly Permission[],
): boolean => {
    const rolePermissionsSet = new Set(getPermissionsForRole(role));
    return requiredPermissions.some((permission) => rolePermissionsSet.has(permission));
};

export const roleTitles: Record<AdminRole, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    EDITOR: "Editor",
};
