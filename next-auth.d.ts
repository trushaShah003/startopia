// declare module"next-auth" {
//     interface Session {
//         id: string;
//     }

//     interface JWT {
//         id: string;
//     }

//     interface NextAuthConfig{
//         providers: Provider[];
//         callbacks: {
//             signIn: (params: { user: User; profile?: Profile }) => Promise<boolean>;
//             jwt: (params: { token: JWT; account?: Account; profile?: Profile }) => Promise<JWT>;
//             session: (params: { session: Session; token: JWT }) => Promise<Session>;
//         };
//     }

//     interface NextAuth {
//         handlers: Record<string, (...args: unknown[]) => unknown>;
//         auth: () => Promise<Session | null>;
//         signIn: () => Promise<void>;
//         signOut: () => Promise<void>;
//     }
// }

import { NextAuthConfig, Session } from "next-auth"
import GitHub from "next-auth/providers/github"
import { client } from "./sanity/lib/client"
import { AUTHOR_BY_GITHUB_ID } from "./sanity/lib/queries"
import { writeClient } from "./sanity/lib/write-client"
import { JWT } from "next-auth/jwt"

// Define the configuration
const authConfig: NextAuthConfig = {
  providers: [GitHub],
  callbacks: {
    async signIn({ user, profile }) {
      const existingUser = await client.fetch(AUTHOR_BY_GITHUB_ID, { id: profile?.id });
      
      if (!existingUser) {
        await writeClient.create({
          _type: 'author',
          id: profile?.id,
          name: user.name,
          username: profile?.login,
          email: user?.email,
          image: user?.image,
          bio: profile?.bio || "",
        })
      }
      
      return true; // Allow sign-in for both new and existing users
    },
    
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const user = await client.fetch(AUTHOR_BY_GITHUB_ID, { id: profile?.id });
        token.id = user._id;
      }
      return token;
    },
    
    async session({ session, token }: { session: Session, token: JWT }) {
      return {
        ...session,
        id: token.id,
      };
    }
  }
}

// Import the auth function from next-auth
import { auth as nextAuth, handlers } from "next-auth/core"

// Create the auth function
export const auth = () => nextAuth(authConfig)

// Export other utility functions
export const { signIn, signOut } = handlers

// Export handlers if using API routes
export { handlers }