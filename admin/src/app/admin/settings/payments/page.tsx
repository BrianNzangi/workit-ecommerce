'use client';

import { useSettingsContext } from '../SettingsProvider';
import { PaymentsTab } from '../tabs';

export default function PaymentsSettingsPage() {
    const { settings, setSettings, canManageSettings } = useSettingsContext();

    return (
        <PaymentsTab
            settings={settings}
            setSettings={setSettings}
            readOnly={!canManageSettings}
        />
    );
}
