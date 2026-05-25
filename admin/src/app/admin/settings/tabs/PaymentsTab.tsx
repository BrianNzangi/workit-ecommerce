'use client';

import { AlertCircle, Eye, EyeOff, Copy, Check, Link } from 'lucide-react';
import { useState } from 'react';
import { Settings } from './index';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface PaymentsTabProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
    readOnly?: boolean;
}

export default function PaymentsTab({ settings, setSettings, readOnly = false }: PaymentsTabProps) {
    const [showSecret, setShowSecret] = useState(false);
    const [copied, setCopied] = useState(false);

    const webhookUrl = settings.payments.webhook_url || `${typeof window !== 'undefined' ? window.location.origin : ''}/api/payments/webhook`;

    const handleCopyWebhook = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Paystack Integration</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Configure Paystack payment gateway for your store</p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-0.5">Get your Paystack API keys</p>
                            <p className="text-blue-700">You can find your API keys in your Paystack Dashboard under Settings → API Keys &amp; Webhooks.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
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
                        <Label htmlFor="paystack_enabled" className="font-medium">Enable Paystack Payments</Label>
                    </div>

                    {settings.payments.paystack_enabled && (
                        <>
                            <Separator />

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="paystack_public_key">Public Key</Label>
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
                                        className="font-mono text-sm h-9"
                                        placeholder="pk_test_xxxxxxxxxxxx"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="paystack_secret_key">Secret Key</Label>
                                    <div className="relative">
                                        <Input
                                            id="paystack_secret_key"
                                            type={showSecret ? 'text' : 'password'}
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
                                            className="font-mono text-sm pr-10 h-9"
                                            placeholder="sk_test_xxxxxxxxxxxx"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                            onClick={() => setShowSecret(!showSecret)}
                                        >
                                            {showSecret ? (
                                                <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                                            ) : (
                                                <Eye className="w-3.5 h-3.5 text-gray-400" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">Keep this key secure and never share it publicly.</p>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label htmlFor="webhook_url">Webhook URL</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="webhook_url"
                                                type="text"
                                                value={webhookUrl}
                                                onChange={(e) =>
                                                    setSettings({
                                                        ...settings,
                                                        payments: {
                                                            ...settings.payments,
                                                            webhook_url: e.target.value,
                                                        },
                                                    })
                                                }
                                                disabled={readOnly}
                                                className="font-mono text-sm h-9 pl-10 pr-20"
                                                placeholder="https://yourdomain.com/api/payments/webhook"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopyWebhook}
                                            className="h-9 shrink-0"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">Add this URL to your Paystack Dashboard under Webhooks to receive payment events.</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
