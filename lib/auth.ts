import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    SpotifyProvider({
      clientId: process.env.AUTH_SPOTIFY_ID || "",
      clientSecret: process.env.AUTH_SPOTIFY_SECRET || "",
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-top-read user-read-email user-read-private",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }: any) {
      if (account && profile) {
        token.accessToken = account.access_token

        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/friends_spotify`, {
          method: "POST",
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            id: token.sub,
            display_name: profile.display_name,
            spotify_id: profile.id,
            refresh_token: account.refresh_token,
            avatar_url: profile.images?.[0]?.url || "",
          }),
        })
      }

      return token
    },
    async session({ session, token }: any) {
      if (token.accessToken) {
        session.accessToken = token.accessToken
      }
      return session
    },
  },
})
