export type SpotifyTrack = {
  name: string
  artist: string
  albumArt: string
}

export type SpotifyArtist = {
  name: string
  plays: number
  genres: string[]
}

export type SpotifyGenre = {
  name: string
  share: number
}

export type SpotifyStats = {
  topTracks: SpotifyTrack[]
  topArtists: SpotifyArtist[]
  genreBreakdown: SpotifyGenre[]
}

export type SavedSpotifyUser = {
  spotifyId: string
  email: string | null
  name: string
  image: string | null
  refreshToken: string
}

export type SavedSpotifyUserWithTopTracks = SavedSpotifyUser & {
  topTracks: SpotifyTrack[]
  topArtists: SpotifyArtist[]
  genreBreakdown: SpotifyGenre[]
  personality: ListenerPersonality
  error?: string
}

export type ListenerPersonality = {
  label: string
  emoji: string
  description: string
  color: string
}

export type CompatibilityResult = {
  score: number // 0–100
  sharedArtists: string[]
  sharedGenres: string[]
  verdict: string
  verdictEmoji: string
}