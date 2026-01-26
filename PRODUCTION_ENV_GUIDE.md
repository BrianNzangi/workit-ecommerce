# Production Environment Variables Guide

## 1. Backend (`packages/backend`)
Create a `.env` file in the `backend` directory (or set these in your hosting provider/VPS).

| Variable | Description | Example / Value |
|:---|:---|:---|
| `DATABASE_URL` | **CRITICAL**. PostgreSQL Connection String | `postgresql://user:password@localhost:5432/workit_db` |
| `PORT` | Port for the backend server | `3001` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `very-long-random-secure-string` |
| `CORS_ORIGIN` | Allowed domains for CORS (Frontend & Admin) | `https://workit-store.com,https://admin.workit-store.com` |

---

## 2. Admin Panel (`packages/admin`)
Create a `.env.local` (or `.env.production`) file in the `admin` directory.

| Variable | Description | Example / Value |
|:---|:---|:---|
| `DATABASE_URL` | **CRITICAL**. Same as Backend DB URL | `postgresql://user:password@localhost:5432/workit_db` |
| `NEXT_PUBLIC_API_URL` | URL of your Backend API | `https://api.workit-store.com` |
| `STOREFRONT_URL` | URL of your live Storefront | `https://workit-store.com` |
| `NEXTAUTH_SECRET` | **CRITICAL**. Random string for NextAuth | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical URL of the Admin Panel | `https://admin.workit-store.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your-google-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `your-google-client-secret` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack Public Key | `pk_live_...` |
| `PAYSTACK_SECRET_KEY` | Paystack Secret Key | `sk_live_...` |

> **Note**: `NEXTAUTH_URL` is required in production for NextAuth.js to work correctly.

---

## 3. Storefront (`packages/frontend`)
Create a `.env.local` (or `.env.production`) file in the `frontend` directory.

| Variable | Description | Example / Value |
|:---|:---|:---|
| `NEXT_PUBLIC_API_URL` | URL of your Backend API | `https://api.workit-store.com` |
| `NEXT_PUBLIC_BACKEND_URL` | Same as API URL | `https://api.workit-store.com` |
| `NEXT_PUBLIC_FRONTEND_BASE_URL` | URL of this Storefront | `https://workit-store.com` |
| `DATABASE_URL` | **CRITICAL**. Same as Backend DB URL | `postgresql://user:password@localhost:5432/workit_db` |
| `BETTER_AUTH_SECRET` | **CRITICAL**. Random string for Better Auth | `same-secure-random-string-as-admin-if-shared` |
| `BETTER_AUTH_URL` | Canonical URL of this Storefront | `https://workit-store.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your-google-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `your-google-client-secret` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack Public Key | `pk_live_...` |
| `PAYSTACK_SECRET_KEY` | Paystack Secret Key | `sk_live_...` |

---

## 🔍 Important Production Checklist
1. **DATABASE_URL**: Ensure all 3 apps connect to the **SAME** database.
2. **Secrets**: Generate strong, unique secrets for `JWT_SECRET`, `NEXTAUTH_SECRET`, and `BETTER_AUTH_SECRET`.
3. **Redirect URIs**: Update Google Cloud Console with your production domains:
   - `https://workit-store.com/api/auth/callback/google`
   - `https://admin.workit-store.com/api/auth/callback/google`
4. **CORS**: Ensure the Backend allows requests from both your Frontend and Admin domains.

