import { db, eq, schema } from "./db.js";

export const RBAC_ROLE_PERMISSIONS_SETTING_KEY = "rbac.role_permissions";

export const adminRoles = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;
export type AdminRole = (typeof adminRoles)[number];
export const customerRole = "CUSTOMER" as const;
export type UserRole = AdminRole | typeof customerRole;

export const permissions = [
    "analytics.view",
    "catalog.manage",
    "customers.manage",
    "marketing.campaigns.manage",
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
        "marketing.campaigns.manage",
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

let cachedRolePermissions: RolePermissionsMap | null = null;
let cacheExpiresAt = 0;
const ROLE_PERMISSION_CACHE_TTL_MS = 30_000;

const cloneRolePermissions = (rolePermissions: RolePermissionsMap): RolePermissionsMap => ({
    SUPER_ADMIN: [...rolePermissions.SUPER_ADMIN],
    ADMIN: [...rolePermissions.ADMIN],
    EDITOR: [...rolePermissions.EDITOR],
});

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

const loadRolePermissionsFromSettings = async (): Promise<RolePermissionsMap> => {
    const stored = await db.query.settings.findFirst({
        where: eq(schema.settings.key, RBAC_ROLE_PERMISSIONS_SETTING_KEY),
    });

    if (!stored) {
        return cloneRolePermissions(defaultRolePermissions);
    }

    try {
        return sanitizeRolePermissionsConfig(JSON.parse(stored.value));
    } catch {
        return cloneRolePermissions(defaultRolePermissions);
    }
};

export const invalidateRolePermissionsCache = () => {
    cachedRolePermissions = null;
    cacheExpiresAt = 0;
};

export const getRolePermissionsConfig = async (): Promise<RolePermissionsMap> => {
    const now = Date.now();

    if (cachedRolePermissions && now < cacheExpiresAt) {
        return cloneRolePermissions(cachedRolePermissions);
    }

    const loaded = await loadRolePermissionsFromSettings();
    cachedRolePermissions = loaded;
    cacheExpiresAt = now + ROLE_PERMISSION_CACHE_TTL_MS;
    return cloneRolePermissions(loaded);
};

export const normalizeAdminRole = (role: unknown): AdminRole | null => {
    if (typeof role !== "string") return null;
    const normalized = role.toUpperCase();
    return (adminRoles as readonly string[]).includes(normalized)
        ? (normalized as AdminRole)
        : null;
};

export const normalizeUserRole = (role: unknown): UserRole | null => {
    if (typeof role !== "string") return null;
    const normalized = role.toUpperCase();
    if (normalized === customerRole) return customerRole;
    return normalizeAdminRole(normalized);
};

export const getPermissionsForRole = (
    role: unknown,
    rolePermissionsMap: RolePermissionsMap = defaultRolePermissions,
): Permission[] => {
    const normalizedRole = normalizeAdminRole(role);
    if (!normalizedRole) return [];
    return [...rolePermissionsMap[normalizedRole]];
};

export const getPermissionsForRoleAsync = async (role: unknown): Promise<Permission[]> => {
    const rolePermissions = await getRolePermissionsConfig();
    return getPermissionsForRole(role, rolePermissions);
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

export const hasPermission = (
    role: unknown,
    requiredPermission: Permission,
    rolePermissionsMap: RolePermissionsMap = defaultRolePermissions,
): boolean => getPermissionsForRole(role, rolePermissionsMap).includes(requiredPermission);

export const hasPermissionAsync = async (
    role: unknown,
    requiredPermission: Permission,
): Promise<boolean> => {
    const rolePermissions = await getRolePermissionsConfig();
    return hasPermission(role, requiredPermission, rolePermissions);
};

export const hasAnyPermission = (
    role: unknown,
    requiredPermissions: readonly Permission[],
    rolePermissionsMap: RolePermissionsMap = defaultRolePermissions,
): boolean => {
    const permissionsForRole = getPermissionsForRole(role, rolePermissionsMap);
    return requiredPermissions.some((permission) =>
        permissionsForRole.includes(permission),
    );
};

export const hasAnyPermissionAsync = async (
    role: unknown,
    requiredPermissions: readonly Permission[],
): Promise<boolean> => {
    const rolePermissions = await getRolePermissionsConfig();
    return hasAnyPermission(role, requiredPermissions, rolePermissions);
};
