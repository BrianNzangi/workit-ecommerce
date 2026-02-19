'use client';

import { Settings } from './index';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface GeneralTabProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
    readOnly?: boolean;
}

export default function GeneralTab({ settings, setSettings, readOnly = false }: GeneralTabProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Store Details</h2>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="site_name">Store Name *</Label>
                        <Input
                            id="site_name"
                            type="text"
                            value={settings.general.site_name}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    general: {
                                        ...settings.general,
                                        site_name: e.target.value,
                                    },
                                })
                            }
                            disabled={readOnly}
                            placeholder="My Store"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="site_email">Store Email *</Label>
                        <Input
                            id="site_email"
                            type="email"
                            value={settings.general.site_email}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    general: {
                                        ...settings.general,
                                        site_email: e.target.value,
                                    },
                                })
                            }
                            disabled={readOnly}
                            placeholder="store@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="site_phone">Store Phone</Label>
                        <Input
                            id="site_phone"
                            type="tel"
                            value={settings.general.site_phone}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    general: {
                                        ...settings.general,
                                        site_phone: e.target.value,
                                    },
                                })
                            }
                            disabled={readOnly}
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="site_address">Store Address</Label>
                        <Textarea
                            id="site_address"
                            value={settings.general.site_address}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    general: {
                                        ...settings.general,
                                        site_address: e.target.value,
                                    },
                                })
                            }
                            rows={3}
                            disabled={readOnly}
                            placeholder="123 Main St, City, Country"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select
                                value={settings.general.default_currency}
                                onValueChange={(value) =>
                                    setSettings({
                                        ...settings,
                                        general: {
                                            ...settings.general,
                                            default_currency: value,
                                        },
                                    })
                                }
                                disabled={readOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                    <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select
                                value={settings.general.timezone}
                                onValueChange={(value) =>
                                    setSettings({
                                        ...settings,
                                        general: {
                                            ...settings.general,
                                            timezone: value,
                                        },
                                    })
                                }
                                disabled={readOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UTC">UTC</SelectItem>
                                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                    <SelectItem value="Africa/Nairobi">East Africa Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
