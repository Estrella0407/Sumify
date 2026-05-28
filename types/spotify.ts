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
  error?: string
}
