'use client';

import { useSettingsContext } from '../SettingsProvider';
import { UsersTab } from '../tabs';

export default function UsersSettingsPage() {
    const { adminUsers, loadingUsers, canManageUsers, onUpdateUserRole, onUpdateUser, onToggleUserStatus, onDeleteUser, onCreateUser } = useSettingsContext();

    return (
        <UsersTab
            adminUsers={adminUsers}
            loadingUsers={loadingUsers}
            onUpdateUserRole={onUpdateUserRole}
            onUpdateUser={onUpdateUser}
            onToggleUserStatus={onToggleUserStatus}
            onDeleteUser={onDeleteUser}
            onCreateUser={onCreateUser}
            readOnly={!canManageUsers}
        />
    );
}
