'use client';

import { useSettingsContext } from '../SettingsProvider';
import { RolesTab } from '../tabs';

export default function RolesSettingsPage() {
    const { rolePermissions, savingRolePermissions, canManageUsers, onTogglePermission } = useSettingsContext();

    return (
        <RolesTab
            rolePermissions={rolePermissions}
            onTogglePermission={onTogglePermission}
            saving={savingRolePermissions}
            readOnly={!canManageUsers}
        />
    );
}
