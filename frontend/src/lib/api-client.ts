import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token: string | null) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    }
};

// Initialize token from localStorage if in browser
if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
        setAuthToken(token);
    }
}
