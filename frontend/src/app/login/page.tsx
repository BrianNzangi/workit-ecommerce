import { redirect } from 'next/navigation';

export default async function LoginPage() {
    // Redirect to homepage with login modal parameter
    redirect('/?auth=login');
}
