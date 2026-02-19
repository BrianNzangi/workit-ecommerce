'use client';

import { AlertCircle } from 'lucide-react';
import { Settings } from './index';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentsTabProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
    readOnly?: boolean;
}

export default function PaymentsTab({ settings, setSettings, readOnly = false }: PaymentsTabProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Paystack Integration</h2>

                <Card className="bg-blue-50 border-blue-200 mb-6">
                    <CardContent className="p-4 flex gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Get your Paystack API keys</p>
                            <p>You can find your API keys in your Paystack Dashboard under Settings → API Keys &amp; Webhooks.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="paystack_enabled"
                            checked={settings.payments.paystack_enabled}
                            onCheckedChange={(checked) =>
                                setSettings({
                                    ...settings,
                                    payments: {
                                        ...settings.payments,
                                        paystack_enabled: checked === true,
                                    },
                                })
                            }
                            disabled={readOnly}
                        />
                        <Label htmlFor="paystack_enabled">Enable Paystack Payments</Label>
                    </div>

                    {settings.payments.paystack_enabled && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="paystack_public_key">Public Key *</Label>
                                <Input
                                    id="paystack_public_key"
                                    type="text"
                                    value={settings.payments.paystack_public_key}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            payments: {
                                                ...settings.payments,
                                                paystack_public_key: e.target.value,
                                            },
                                        })
                                    }
                                    disabled={readOnly}
                                    className="font-mono text-sm"
                                    placeholder="pk_test_xxxxxxxxxxxx"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paystack_secret_key">Secret Key *</Label>
                                <Input
                                    id="paystack_secret_key"
                                    type="password"
                                    value={settings.payments.paystack_secret_key}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            payments: {
                                                ...settings.payments,
                                                paystack_secret_key: e.target.value,
                                            },
                                        })
                                    }
                                    disabled={readOnly}
                                    className="font-mono text-sm"
                                    placeholder="sk_test_xxxxxxxxxxxx"
                                />
                                <p className="text-xs text-gray-500">Keep this key secure and never share it publicly.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
