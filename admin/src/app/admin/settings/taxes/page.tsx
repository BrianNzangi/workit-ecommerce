'use client';

import { useSettingsContext } from '../SettingsProvider';
import { TaxesTab } from '../tabs';

export default function TaxesSettingsPage() {
    const { settings, setSettings, canManageSettings } = useSettingsContext();

    return (
        <TaxesTab
            settings={settings}
            setSettings={setSettings}
            readOnly={!canManageSettings}
        />
    );
}
