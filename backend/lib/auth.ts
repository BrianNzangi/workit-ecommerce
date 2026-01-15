import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { AuthService } from './services/auth.service';
import { authConfig } from './auth.config';

const authService = new AuthService(prisma);

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

          if (result.user) {
            return {
              id: result.user.id,
              email: result.user.email,
              name: `${result.user.firstName} ${result.user.lastName}`,
              role: result.user.role,
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
});
