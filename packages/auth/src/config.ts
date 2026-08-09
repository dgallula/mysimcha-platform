import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {
  findActiveUserByEmail,
  getPrimaryMembership,
  listMembershipsForUser,
} from "@mysimcha/database";
import { loginSchema, type OrgRole, type PlatformRole } from "@mysimcha/shared";
import { verifyPassword } from "./password";

type AppToken = {
  sub?: string;
  platformRole?: PlatformRole | null;
  organizationId?: string | null;
  organizationRole?: OrgRole | null;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      platformRole?: PlatformRole | null;
      organizationId?: string | null;
      organizationRole?: OrgRole | null;
    };
  }

  interface User {
    platformRole?: PlatformRole | null;
    organizationId?: string | null;
    organizationRole?: OrgRole | null;
  }
}

/**
 * Auth.js config for Sprint 1.
 * Credentials require JWT session strategy (Auth.js constraint).
 * Database Session/Account tables remain for future OAuth / DB sessions.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 14,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await findActiveUserByEmail(parsed.data.email);
        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        const primary = await getPrimaryMembership(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          platformRole: user.platformRole as PlatformRole | null,
          organizationId: primary?.organizationId ?? null,
          organizationRole: (primary?.role as OrgRole | undefined) ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const appToken = token as AppToken;

      if (user) {
        appToken.sub = user.id;
        appToken.platformRole = user.platformRole ?? null;
        appToken.organizationId = user.organizationId ?? null;
        appToken.organizationRole = user.organizationRole ?? null;
      }

      if (trigger === "update" && session && typeof session === "object") {
        const organizationId =
          "organizationId" in session && typeof session.organizationId === "string"
            ? session.organizationId
            : null;
        if (organizationId && appToken.sub) {
          const memberships = await listMembershipsForUser(appToken.sub);
          const match = memberships.find((m) => m.organizationId === organizationId);
          if (match) {
            appToken.organizationId = match.organizationId;
            appToken.organizationRole = match.role as OrgRole;
          }
        }
      }

      return appToken;
    },
    async session({ session, token }) {
      const appToken = token as AppToken;
      if (session.user && appToken.sub) {
        session.user.id = appToken.sub;
        session.user.platformRole = appToken.platformRole ?? null;
        session.user.organizationId = appToken.organizationId ?? null;
        session.user.organizationRole = appToken.organizationRole ?? null;
      }
      return session;
    },
  },
});
