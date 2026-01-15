'use client';

import { ChevronDown } from 'lucide-react';
import { Settings } from './index';

interface GeneralTabProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
}

export default function GeneralTab({ settings, setSettings }: GeneralTabProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Store Details
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Store Name *
                        </label>
                        <input
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                            placeholder="My Store"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Store Email *
                        </label>
                        <input
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                            placeholder="store@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Store Phone
                        </label>
                        <input
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                            placeholder="+1 234 567 8900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Store Address
                        </label>
                        <textarea
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                            placeholder="123 Main St, City, Country"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Currency
                            </label>
                            <div className="relative">
                                <select
                                    value={settings.general.default_currency}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            general: {
                                                ...settings.general,
                                                default_currency: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-xs bg-white focus:ring-2 focus:ring-[#FF5023] focus:border-transparent cursor-pointer"
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="KES">KES - Kenyan Shilling</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Timezone
                            </label>
                            <div className="relative">
                                <select
                                    value={settings.general.timezone}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            general: {
                                                ...settings.general,
                                                timezone: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-xs bg-white focus:ring-2 focus:ring-[#FF5023] focus:border-transparent cursor-pointer"
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">Eastern Time</option>
                                    <option value="America/Los_Angeles">Pacific Time</option>
                                    <option value="Africa/Nairobi">East Africa Time</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
