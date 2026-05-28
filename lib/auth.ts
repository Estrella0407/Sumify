import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import { saveSpotifyUser } from "./db"

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
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }

      if (account?.refresh_token && profile?.id) {
        try {
          await saveSpotifyUser({
            spotifyId: profile.id,
            email: profile.email ?? null,
            name: profile.display_name ?? profile.email ?? profile.id,
            image: profile.images?.[0]?.url ?? null,
            refreshToken: account.refresh_token,
          })
        } catch (error) {
          console.error("Failed to save Spotify user to Supabase:", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken
      }
      return session
    },
  },
})
