import NextAuth, { NextAuthOptions } from "next-auth";
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
          
          // Check if user exists
          const existingUser = await sql`SELECT id, role FROM users WHERE line_user_id = ${lineUserId}`;
          
          if (existingUser.rowCount === 0) {
            // Check if this is the first user ever, if so make them admin
            const userCount = await sql`SELECT COUNT(*) as count FROM users`;
            let role = 'user';
            
            if (userCount.rows[0].count == 0) {
              role = 'admin';
            } else if (lineUserId === 'YOUR_SPECIFIC_LINE_ID') {
              // We will update this later when they provide their ID
              role = 'admin';
            }

            // Create new user
            await sql`
              INSERT INTO users (line_user_id, display_name, role)
              VALUES (${lineUserId}, ${displayName}, ${role})
            `;
          }
          return true;
        } catch (error) {
          console.error("Error saving user to DB:", error);
          return true; // Still allow login even if DB fails for now
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        // Fetch user from DB to attach role and actual ID
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
