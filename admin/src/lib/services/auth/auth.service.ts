import { validationError, unauthorizedError } from "@/lib/graphql/errors";
import { RegisterAdminInput, LoginInput, AuthPayload } from "./auth.types";

const backendBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_API_URL ||
    "http://localhost:3001";

export class AuthService {
    private async postAuth<T>(path: string, body: Record<string, unknown>): Promise<T> {
        const response = await fetch(`${backendBaseUrl}/auth/${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error((data as any)?.message || "Authentication request failed");
        }

        return data as T;
    }

    async register(input: RegisterAdminInput): Promise<AuthPayload> {
        try {
            const result = await this.postAuth<any>("sign-up/email", {
                email: input.email,
                password: input.password,
                name: `${input.firstName} ${input.lastName}`.trim(),
                firstName: input.firstName,
                lastName: input.lastName,
                role: input.role ?? "ADMIN",
            });

            const user = result?.user ?? result;
            const token = result?.token ?? "";

            return {
                token,
                access_token: token,
                user,
                expiresAt: this.getTokenExpiration(),
            };
        } catch (error: any) {
            throw validationError(error.message || "Registration failed");
        }
    }

    async login(input: LoginInput): Promise<AuthPayload> {
        try {
            const result = await this.postAuth<any>("sign-in/email", {
                email: input.email,
                password: input.password,
            });

            const token = result?.token ?? "";
            const user = result?.user ?? null;

            return {
                token,
                access_token: token,
                user,
                expiresAt: this.getTokenExpiration(),
            };
        } catch (_error: any) {
            throw unauthorizedError("Invalid credentials");
        }
    }

    private getTokenExpiration(): Date {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        return expiresAt;
    }
}
