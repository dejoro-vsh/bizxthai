import { NextAuthOptions } from "next-auth";
import LineProvider from "next-auth/providers/line";
import { sql } from "@vercel/postgres";

export const authOptions: NextAuthOptions = {
  providers: [
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID || "",
      clientSecret: process.env.LINE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "line") {
        try {
          const lineUserId = profile?.sub || user.id;
          const displayName = user.name || "LINE User";
          
          const existingUser = await sql`SELECT id, role FROM users WHERE line_user_id = ${lineUserId}`;
          
          const SUPER_ADMIN_LINE_ID = 'U8b0bd1d26e337c3b73efe5a53bb4b628';
          
          if (existingUser.rowCount === 0) {
            const userCount = await sql`SELECT COUNT(*) as count FROM users`;
            let role = 'user';
            
            if (userCount.rows[0].count == 0) {
              role = 'admin';
            } else if (lineUserId === SUPER_ADMIN_LINE_ID) {
              role = 'admin';
            }

            await sql`
              INSERT INTO users (line_user_id, display_name, role)
              VALUES (${lineUserId}, ${displayName}, ${role})
            `;
          } else {
            // Auto-upgrade if it's the super admin but they are somehow not admin
            if (lineUserId === SUPER_ADMIN_LINE_ID && existingUser.rows[0].role !== 'admin') {
              await sql`UPDATE users SET role = 'admin' WHERE line_user_id = ${lineUserId}`;
            }
          }
          return true;
        } catch (error) {
          console.error("Error saving user to DB:", error);
          return true; 
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        try {
          const dbUser = await sql`SELECT id, role FROM users WHERE line_user_id = ${token.sub}`;
          if (dbUser.rowCount && dbUser.rowCount > 0) {
            (session.user as any).id = dbUser.rows[0].id;
            (session.user as any).role = dbUser.rows[0].role;
            (session.user as any).lineUserId = token.sub;
          }
        } catch (error) {
          console.error("Error fetching session user:", error);
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (account && profile) {
        token.sub = profile.sub as string;
      }
      return token;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
