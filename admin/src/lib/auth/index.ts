// Server-side auth
export { auth } from "./auth-server";
export type { Session, User } from "./auth-server";

// Client-side auth
export {
    authClient,
    useSession,
    signIn,
    signUp,
    signOut,
    useIsAdmin,
    useFullName,
} from "./auth-client";

// Types
export type {
    AuthState,
    LoginCredentials,
    RegisterData,
    AuthError,
    AuthResponse,
} from "./auth.types";

// Middleware
export {
    requireAuth,
    requireAdmin,
    authMiddleware
} from "./auth-middleware";
