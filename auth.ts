// import NextAuth from "next-auth"
// import GitHub from "next-auth/providers/github"
// import { client } from "./sanity/lib/client"
// import { AUTHOR_BY_GITHUB_ID } from "./sanity/lib/queries"
// import { writeClient } from "./sanity/lib/write-client"
 
// export const { handlers, auth, signIn, signOut } = NextAuth({
//   providers: [GitHub],
//   callbacks:{
//     async signIn({ user, profile}){
//       const existingUser = await client.fetch(AUTHOR_BY_GITHUB_ID, {id: profile?.id});

//       if(!existingUser){
//         await writeClient.create({
//           _type: 'author',
//           id: profile?.id,
//           name: user.name,
//           username: profile?.login,
//           email: user?.email,
//           image: user?.image,
//           bio: profile?.bio || "",
//         })
//       }

//       if(existingUser){
//         return true;
//       }
      
//     },
//     async jwt({token, account, profile}: { token: { id?: string }; account?: { provider?: string; type?: string }; profile?: { id?: string; login?: string } }){
//       if(account && profile){
//         const user = await client.fetch(AUTHOR_BY_GITHUB_ID,{ id: profile?.id });

//         token.id = user._id;
//       }

//       return token;
//     },
//     async session({session, token}){
//       Object.assign(session, {id: token.id});
//       return session;
//     }
//   }
// })

///////////////////////////////////////////////////////////////////////////
// import NextAuth, { Session } from "next-auth"
// import GitHub from "next-auth/providers/github"
// import { client } from "./sanity/lib/client"
// import { AUTHOR_BY_GITHUB_ID } from "./sanity/lib/queries"
// import { writeClient } from "./sanity/lib/write-client"

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   providers: [GitHub],
//   callbacks: {
//     async signIn({ user, profile }: { user: { name?: string; email?: string; image?: string }; profile: { id?: string; login?: string; bio?: string } }) {
//       const existingUser = await client.fetch(AUTHOR_BY_GITHUB_ID, { id: profile?.id });
      
//       if (!existingUser) {
//         await writeClient.create({
//           _type: 'author', // Fixed: removed asterisk, changed to _type
//           id: profile?.id,
//           name: user.name,
//           username: profile?.login,
//           email: user?.email,
//           image: user?.image,
//           bio: profile?.bio || "",
//         })
//       }
      
//       if (existingUser) {
//         return true;
//       }
      
//       return true; // Added explicit return for when a new user is created
//     },
    
//     async jwt({ token, account, profile }: { token: { id?: string }; account?: { provider?: string; type?: string }; profile?: { id?: string; login?: string } }) {
//       if (account && profile) {
//         const user = await client.fetch(AUTHOR_BY_GITHUB_ID, { id: profile?.id });
//         token.id = user._id;
//       }
//       return token;
//     },
    
//     async session({ session, token }: { session: Session; token: { id?: string } }) {
//       Object.assign(session, { id: token.id });
//       return session;
//     }
//   }
// })


/////////////////////////////////////////////////////////////////////


import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { client } from "./sanity/lib/client"
import { AUTHOR_BY_GITHUB_ID } from "./sanity/lib/queries"
import { writeClient } from "./sanity/lib/write-client"

// Create the auth config
export const { 
  handlers, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const existingUser = await client.withConfig({useCdn: false}).fetch(AUTHOR_BY_GITHUB_ID, { id: profile?.id });
      
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
      
      return true;
    },
    
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const user = await client.withConfig({useCdn: false}).fetch(AUTHOR_BY_GITHUB_ID, { id: profile?.id });
        if (user) {
          token.id = user._id;
        }
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
})