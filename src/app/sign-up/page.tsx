import { redirect } from 'next/navigation';

export default async function SignUpPage() {
    // Redirect to homepage with sign-up modal parameter
    redirect('/?auth=signup');
}
