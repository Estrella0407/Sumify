"use client"

import { createContext, useContext } from "react"
import type {
  ListenerPersonality,
  SpotifyArtist,
  SpotifyGenre,
} from "../types/spotify"

export type CurrentUser = {
  id?: string
  name: string
  image: string | null
  topArtists: SpotifyArtist[]
  genreBreakdown: SpotifyGenre[]
  personality: ListenerPersonality
}

const CurrentUserContext = createContext<CurrentUser | null>(null)

export function CurrentUserProvider({
  value,
  children,
}: {
  value: CurrentUser
  children: React.ReactNode
}) {
  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext)

  if (!context) {
    throw new Error("useCurrentUser must be used inside CurrentUserProvider")
  }

  return context
}