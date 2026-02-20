import { Mail, Phone, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomerFormData } from './types';

interface CustomerDetailsCardProps {
    formData: CustomerFormData;
    disabled?: boolean;
    onFieldChange: (field: keyof CustomerFormData, value: string) => void;
}

export function CustomerDetailsCard({ formData, disabled, onFieldChange }: CustomerDetailsCardProps) {
    return (
        <Card className="border-gray-200 shadow-xs">
            <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-primary-50 text-primary-900">
                        <User className="h-4 w-4" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black tracking-tight text-secondary-900">
                            Customer Information
                        </CardTitle>
                        <CardDescription className="font-medium text-secondary-500">
                            Basic profile and contact details.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(event) => onFieldChange('firstName', event.target.value)}
                            disabled={disabled}
                            required
                            autoComplete="given-name"
                            placeholder="John"
                            className="border-gray-200 focus-visible:ring-primary-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(event) => onFieldChange('lastName', event.target.value)}
                            disabled={disabled}
                            required
                            autoComplete="family-name"
                            placeholder="Doe"
                            className="border-gray-200 focus-visible:ring-primary-200"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="inline-flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-secondary-400" />
                        Email Address *
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(event) => onFieldChange('email', event.target.value)}
                        disabled={disabled}
                        required
                        autoComplete="email"
                        placeholder="john.doe@example.com"
                        className="border-gray-200 focus-visible:ring-primary-200"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="inline-flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-secondary-400" />
                        Phone Number
                    </Label>
                    <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(event) => onFieldChange('phoneNumber', event.target.value)}
                        disabled={disabled}
                        autoComplete="tel"
                        placeholder="+254 700 000 000"
                        className="border-gray-200 focus-visible:ring-primary-200"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
