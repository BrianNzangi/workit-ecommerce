import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { AuthService } from './services/auth.service';
import { authConfig } from './auth.config';

// AuthService no longer needs Prisma, as it uses the API client
const authService = new AuthService();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const result = await authService.login({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (result.user && result.access_token) {
            return {
              id: result.user.id,
              email: result.user.email,
              name: `${result.user.firstName} ${result.user.lastName}`,
              role: result.user.role,
              accessToken: result.access_token,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
});
