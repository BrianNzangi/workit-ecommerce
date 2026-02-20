export type CustomerFormMode = 'create' | 'edit';

export interface CustomerFormData {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}
