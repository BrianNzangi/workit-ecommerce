'use client';

import { useSettingsContext } from '../SettingsProvider';
import { GeneralTab } from '../tabs';

export default function GeneralSettingsPage() {
    const { settings, setSettings, canManageSettings } = useSettingsContext();

    return (
        <GeneralTab
            settings={settings}
            setSettings={setSettings}
            readOnly={!canManageSettings}
        />
    );
}
