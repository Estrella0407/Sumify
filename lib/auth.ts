import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"

export const authOptions: NextAuthOptions = {
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
      // First sign in
      if (account && profile) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = Date.now() + (account.expires_in as number) * 1000
        token.spotifyId = (profile as any).id
        return token
      }

      // Token still valid
      if (Date.now() < (token.expiresAt as number)) {
        return token
      }

      // Token expired — refresh it
      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.AUTH_SPOTIFY_ID}:${process.env.AUTH_SPOTIFY_SECRET}`
            ).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: token.refreshToken as string,
          }),
        })
        const refreshed = await response.json()
        token.accessToken = refreshed.access_token
        token.expiresAt = Date.now() + refreshed.expires_in * 1000
        if (refreshed.refresh_token) token.refreshToken = refreshed.refresh_token
      } catch {
        // Refresh failed — user needs to re-auth
        token.accessToken = undefined
      }

      return token
    },

    async session({ session, token }: any) {
      if (token.accessToken) {
        session.accessToken = token.accessToken
      }

      if (token.spotifyId) {
        session.spotifyId = token.spotifyId
      }

      return session
    },
  },
}

export default NextAuth(authOptions)
