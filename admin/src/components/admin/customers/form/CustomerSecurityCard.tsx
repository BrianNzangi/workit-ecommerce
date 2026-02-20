import { LockKeyhole } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomerFormData } from './types';

interface CustomerSecurityCardProps {
    formData: CustomerFormData;
    disabled?: boolean;
    onFieldChange: (field: keyof CustomerFormData, value: string) => void;
}

export function CustomerSecurityCard({ formData, disabled, onFieldChange }: CustomerSecurityCardProps) {
    return (
        <Card className="border-gray-200 shadow-xs">
            <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-primary-50 text-primary-900">
                        <LockKeyhole className="h-4 w-4" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black tracking-tight text-secondary-900">
                            Account Security
                        </CardTitle>
                        <CardDescription className="font-medium text-secondary-500">
                            Set secure credentials for the customer login.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(event) => onFieldChange('password', event.target.value)}
                        disabled={disabled}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="Minimum 8 characters"
                        className="border-gray-200 focus-visible:ring-primary-200"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(event) => onFieldChange('confirmPassword', event.target.value)}
                        disabled={disabled}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        className="border-gray-200 focus-visible:ring-primary-200"
                    />
                </div>

                <div className="rounded-xs border border-primary-100 bg-primary-50 px-3 py-2.5">
                    <p className="text-xs font-semibold text-primary-900">
                        Password must be at least 8 characters long.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
