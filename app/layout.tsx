import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sumify | Group Spotify Stats",
  description: "A multi-user Spotify leaderboard for top tracks, artists and genres.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
