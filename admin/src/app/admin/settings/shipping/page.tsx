'use client';

import { useSettingsContext } from '../SettingsProvider';
import { ShippingTab } from '../tabs';

export default function ShippingSettingsPage() {
    const { canManageSettings } = useSettingsContext();

    return <ShippingTab readOnly={!canManageSettings} />;
}
