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
import { Globe, Mail, Phone, MapPin, Clock, DollarSign } from 'lucide-react';

interface GeneralTabProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
    readOnly?: boolean;
}

export default function GeneralTab({ settings, setSettings, readOnly = false }: GeneralTabProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Store Details</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Basic information about your store</p>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="site_name">Store Name</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                                    className="pl-10 h-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="site_email">Store Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                                    className="pl-10 h-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="site_phone">Store Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                                    className="pl-10 h-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
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
                                    <SelectTrigger className="pl-10 h-9">
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
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="site_address">Store Address</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
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
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Timezone</Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
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
                                <SelectTrigger className="pl-10 h-9">
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
