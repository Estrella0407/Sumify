import type { SpotifyArtist, SpotifyGenre, SpotifyStats, SpotifyTrack } from "../types/spotify"

const SPOTIFY_BASE = "https://api.spotify.com/v1"

async function fetchSpotifyJson(accessToken: string, endpoint: string) {
  const response = await fetch(`${SPOTIFY_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch Spotify data")
  }

  return response.json()
}

export async function getTopTracks(accessToken: string): Promise<SpotifyTrack[]> {
  const data = await fetchSpotifyJson(accessToken, "/me/top/tracks?limit=5&time_range=short_term")
  return data.items.map((track: any) => ({
    name: track.name,
    artist: track.artists?.[0]?.name ?? "Unknown artist",
    albumArt: track.album?.images?.[2]?.url ?? "",
  }))
}

async function refreshSpotifyAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.AUTH_SPOTIFY_ID
  const clientSecret = process.env.AUTH_SPOTIFY_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify client credentials")
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  })

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })

  if (!response.ok) {
    throw new Error("Unable to refresh Spotify access token")
  }

  const payload = await response.json()
  if (!payload.access_token) {
    throw new Error("Spotify refresh response did not contain an access token")
  }

  return payload.access_token
}

export async function getTopTracksForRefreshToken(refreshToken: string): Promise<SpotifyTrack[]> {
  const accessToken = await refreshSpotifyAccessToken(refreshToken)
  return getTopTracks(accessToken)
}

async function fetchTopArtists(accessToken: string, limit = 10): Promise<any[]> {
  const data = await fetchSpotifyJson(accessToken, `/me/top/artists?limit=${limit}&time_range=short_term`)
  return data.items ?? []
}

export async function getTopArtists(accessToken: string): Promise<SpotifyArtist[]> {
  const artists = await fetchTopArtists(accessToken, 8)
  return artists.slice(0, 5).map((artist: any) => ({
    name: artist.name,
    plays: artist.popularity ?? 0,
    genres: artist.genres ?? [],
  }))
}

export async function getGenreBreakdown(accessToken: string): Promise<SpotifyGenre[]> {
  const artists = await fetchTopArtists(accessToken, 10)
  const genreCount = new Map<string, number>()

  artists.forEach((artist: any) => {
    const genres = artist.genres ?? []
    genres.slice(0, 2).forEach((genre: string) => {
      genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1)
    })
  })

  const entries = Array.from(genreCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const total = entries.reduce((sum, [, count]) => sum + count, 0) || 1

  return entries.map(([name, count]) => ({
    name,
    share: Math.round((count / total) * 100),
  }))
}

export async function getPersonalStats(accessToken: string): Promise<SpotifyStats> {
  const [topTracks, topArtists] = await Promise.all([
    getTopTracks(accessToken),
    getTopArtists(accessToken),
  ])
  const genreBreakdown = await getGenreBreakdown(accessToken)

  return {
    topTracks,
    topArtists,
    genreBreakdown,
  }
}
