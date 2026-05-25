'use client';

import { useSettingsContext } from '../SettingsProvider';
import { UsersTab } from '../tabs';

export default function UsersSettingsPage() {
    const { adminUsers, loadingUsers, canManageUsers, onUpdateUserRole, onToggleUserStatus, onDeleteUser, onCreateUser } = useSettingsContext();

    return (
        <UsersTab
            adminUsers={adminUsers}
            loadingUsers={loadingUsers}
            onUpdateUserRole={onUpdateUserRole}
            onToggleUserStatus={onToggleUserStatus}
            onDeleteUser={onDeleteUser}
            onCreateUser={onCreateUser}
            readOnly={!canManageUsers}
        />
    );
}
