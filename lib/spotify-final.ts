import type {
  SpotifyArtist,
  SpotifyGenre,
  SpotifyStats,
  SpotifyTrack,
  ListenerPersonality,
  CompatibilityResult,
} from "../types/spotify"

const SPOTIFY_BASE = "https://api.spotify.com/v1"

async function fetchSpotifyJson(accessToken: string, endpoint: string) {
  const response = await fetch(`${SPOTIFY_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`Spotify fetch failed: ${endpoint}`)
  return response.json()
}

export async function refreshSpotifyAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.AUTH_SPOTIFY_ID
  const clientSecret = process.env.AUTH_SPOTIFY_SECRET
  if (!clientId || !clientSecret) throw new Error("Missing Spotify credentials")

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
  })
  if (!response.ok) throw new Error("Unable to refresh Spotify access token")
  const payload = await response.json()
  if (!payload.access_token) throw new Error("No access token in refresh response")
  return payload.access_token
}

export async function getTopTracks(accessToken: string): Promise<SpotifyTrack[]> {
  const data = await fetchSpotifyJson(accessToken, "/me/top/tracks?limit=5&time_range=short_term")
  return data.items.map((track: any) => ({
    name: track.name,
    artist: track.artists?.[0]?.name ?? "Unknown artist",
    albumArt: track.album?.images?.[2]?.url ?? "",
  }))
}

async function fetchTopArtistsRaw(accessToken: string, limit = 10): Promise<any[]> {
  const data = await fetchSpotifyJson(
    accessToken,
    `/me/top/artists?limit=${limit}&time_range=short_term`
  )
  return data.items ?? []
}

export async function getTopArtists(accessToken: string): Promise<SpotifyArtist[]> {
  const artists = await fetchTopArtistsRaw(accessToken, 8)
  return artists.slice(0, 5).map((artist: any) => ({
    name: artist.name,
    plays: artist.popularity ?? 0,
    genres: artist.genres ?? [],
  }))
}

export async function getGenreBreakdown(accessToken: string): Promise<SpotifyGenre[]> {
  const artists = await fetchTopArtistsRaw(accessToken, 10)
  const genreCount = new Map<string, number>()
  artists.forEach((artist: any) => {
    ;(artist.genres ?? []).slice(0, 2).forEach((genre: string) => {
      genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1)
    })
  })
  const entries = Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const total = entries.reduce((sum, [, c]) => sum + c, 0) || 1
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
  return { topTracks, topArtists, genreBreakdown }
}

/** Fetches tracks + artists + genres for a saved user given their refresh token */
export async function getFullStatsForRefreshToken(refreshToken: string): Promise<SpotifyStats> {
  const accessToken = await refreshSpotifyAccessToken(refreshToken)
  return getPersonalStats(accessToken)
}

// ── Personality ────────────────────────────────────────────────────────────────

const PERSONALITIES: Array<{
  genres: string[]
  label: string
  emoji: string
  description: string
  color: string
}> = [
  {
    genres: ["k-pop", "korean pop", "k-rap", "korean r&b"],
    label: "K-Pop Stan",
    emoji: "⭐",
    description: "You live for the choreos, the fancams, and the comebacks.",
    color: "#ff6eb4",
  },
  {
    genres: ["hip hop", "rap", "trap", "drill", "afrobeats", "afropop"],
    label: "Rhythm Chaser",
    emoji: "🎤",
    description: "You feel the beat before you hear the melody.",
    color: "#f5a623",
  },
  {
    genres: ["indie", "indie pop", "indie rock", "lo-fi", "bedroom pop"],
    label: "Indie Explorer",
    emoji: "🌿",
    description: "You find gems before they blow up. Taste level: elite.",
    color: "#7ed321",
  },
  {
    genres: ["pop", "dance pop", "electropop", "synth-pop"],
    label: "Pop Enthusiast",
    emoji: "✨",
    description: "Certified bop detector. You know every hook.",
    color: "#bd10e0",
  },
  {
    genres: ["r&b", "soul", "neo soul", "contemporary r&b"],
    label: "Soul Seeker",
    emoji: "🕯️",
    description: "You listen with your whole heart, every time.",
    color: "#e8734a",
  },
  {
    genres: ["rock", "alternative rock", "classic rock", "punk", "metal", "emo"],
    label: "Rock Devotee",
    emoji: "🎸",
    description: "Volume up. Always. Guitar solos hit different for you.",
    color: "#d0021b",
  },
  {
    genres: ["electronic", "edm", "house", "techno", "ambient", "experimental"],
    label: "Sound Architect",
    emoji: "🎛️",
    description: "You hear textures and layers others don't even notice.",
    color: "#4a90e2",
  },
  {
    genres: ["jazz", "classical", "blues", "folk", "country", "acoustic"],
    label: "Timeless Listener",
    emoji: "🎹",
    description: "You appreciate craft over trends. Old soul energy.",
    color: "#c8a96e",
  },
]

const DEFAULT_PERSONALITY: ListenerPersonality = {
  label: "Genre Nomad",
  emoji: "🌍",
  description: "You defy categories. Your playlist is a world tour.",
  color: "#1DB954",
}

const normalizeGenreName = (value: string) =>
  value
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\bkorean pop\b|\bk-pop\b|\bkpop\b/g, "kpop")
    .replace(/\bkorean r&b\b|\bkorean rb\b|\bk-r&b\b|\bk-rb\b/g, "krnb")

const genreMatches = (genreA: string, genreB: string) => {
  const a = normalizeGenreName(genreA)
  const b = normalizeGenreName(genreB)
  return a === b || a.includes(b) || b.includes(a)
}

export function derivePersonality(genres: SpotifyGenre[]): ListenerPersonality {
  const topGenreNames = genres.map((g) => normalizeGenreName(g.name))
  let bestMatch = { personality: DEFAULT_PERSONALITY, score: 0 }

  for (const p of PERSONALITIES) {
    const score = p.genres.reduce((acc, g) => {
      return acc + topGenreNames.filter((tg) => genreMatches(tg, g)).length
    }, 0)
    if (score > bestMatch.score) {
      bestMatch = {
        personality: {
          label: p.label,
          emoji: p.emoji,
          description: p.description,
          color: p.color,
        },
        score,
      }
    }
  }

  return bestMatch.personality
}

// ── Compatibility ──────────────────────────────────────────────────────────────

const VERDICTS: Array<{ min: number; verdict: string; emoji: string }> = [
  { min: 85, verdict: "Musical soulmates", emoji: "💚" },
  { min: 65, verdict: "Solid vibe match", emoji: "🎵" },
  { min: 45, verdict: "Some common ground", emoji: "🤝" },
  { min: 25, verdict: "Opposite tastes", emoji: "🔀" },
  { min: 0, verdict: "Complete wildcards", emoji: "🌪️" },
]

export function computeCompatibility(
  a: { topArtists: SpotifyArtist[]; genreBreakdown: SpotifyGenre[] },
  b: { topArtists: SpotifyArtist[]; genreBreakdown: SpotifyGenre[] }
): CompatibilityResult {
  const aArtists = new Set(a.topArtists.map((x) => x.name.toLowerCase()))
  const bArtists = new Set(b.topArtists.map((x) => x.name.toLowerCase()))
  const sharedArtists = [...aArtists]
    .filter((x) => bArtists.has(x))
    .map((x) => a.topArtists.find((a) => a.name.toLowerCase() === x)!.name)

  const aGenres = new Set(a.genreBreakdown.map((g) => g.name.toLowerCase()))
  const bGenres = new Set(b.genreBreakdown.map((g) => g.name.toLowerCase()))
  const sharedGenres = [...aGenres]
    .filter((x) => bGenres.has(x))
    .map((x) => a.genreBreakdown.find((g) => g.name.toLowerCase() === x)!.name)

  const artistScore =
    aArtists.size + bArtists.size > 0
      ? (sharedArtists.length * 2) / (aArtists.size + bArtists.size)
      : 0
  const genreScore =
    aGenres.size + bGenres.size > 0
      ? (sharedGenres.length * 2) / (aGenres.size + bGenres.size)
      : 0

  const raw = artistScore * 0.6 + genreScore * 0.4
  const score = Math.round(
    Math.min(100, raw * 180 + (sharedArtists.length > 0 ? 15 : 0))
  )

  const { verdict, emoji } = VERDICTS.find((v) => score >= v.min)!
  return { score, sharedArtists, sharedGenres, verdict, verdictEmoji: emoji }
}