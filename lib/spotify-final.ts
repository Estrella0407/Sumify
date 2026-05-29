import type {
  SpotifyArtist,
  SpotifyGenre,
  SpotifyStats,
  SpotifyTrack,
  ListenerPersonality,
  CompatibilityResult,
} from "../types/spotify"

export type TimeRange = "short_term" | "medium_term" | "long_term"

const SPOTIFY_BASE = "https://api.spotify.com/v1"

async function fetchSpotifyJson(accessToken: string, endpoint: string) {
  const response = await fetch(`${SPOTIFY_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(`Spotify ${response.status} on ${endpoint}: ${text}`)
  }
  return response.json()
}

export async function refreshSpotifyAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.AUTH_SPOTIFY_ID
  const clientSecret = process.env.AUTH_SPOTIFY_SECRET
  if (!clientId || !clientSecret) throw new Error("Missing Spotify credentials")

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })
  if (!response.ok) throw new Error("Unable to refresh Spotify access token")
  const payload = await response.json()
  if (!payload.access_token) throw new Error("No access token in refresh response")
  return payload.access_token
}

export async function getTopTracks(
  accessToken: string,
  timeRange: TimeRange = "short_term"
): Promise<SpotifyTrack[]> {
  const data = await fetchSpotifyJson(
    accessToken,
    `/me/top/tracks?limit=5&time_range=${timeRange}`
  )
  return (data.items ?? []).map((track: any) => ({
    name: track.name,
    artist: track.artists?.[0]?.name ?? "Unknown artist",
    albumArt: track.album?.images?.[2]?.url ?? "",
  }))
}

async function fetchRawArtists(
  accessToken: string,
  timeRange: TimeRange = "short_term",
  limit = 10
): Promise<any[]> {
  const data = await fetchSpotifyJson(
    accessToken,
    `/me/top/artists?limit=${limit}&time_range=${timeRange}`
  )

  console.log(
    "artist keys",
    Object.keys(data.items?.[0] ?? {})
  )

  return data.items ?? []
}

function rawArtistsToTopArtists(raw: any[]): SpotifyArtist[] {
  const artists = raw.slice(0, 5).map((artist: any) => ({
    name: artist.name,
    genres: artist.genres ?? []
  }))

  console.log("mapped top artists", artists)

  return artists
}

function rawArtistsToGenreBreakdown(raw: any[]): SpotifyGenre[] {
  const genreCount = new Map<string, number>()
  raw.forEach((artist: any) => {
    ;(artist.genres ?? []).forEach((genre: string) => {
      genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1)
    })
  })
  const allEntries = Array.from(genreCount.entries()).sort(
    (a, b) => b[1] - a[1]
  )
  const total = allEntries.reduce((sum, [, count]) => sum + count, 0) || 1
  return allEntries.slice(0, 5).map(([name, count]) => ({
    name,
    share: Math.round((count / total) * 100),
  }))
}

export async function getPersonalStats(
  accessToken: string,
  timeRange: TimeRange = "short_term"
): Promise<SpotifyStats> {
  const [topTracks, rawArtists] = await Promise.all([
    getTopTracks(accessToken, timeRange),
    fetchRawArtists(accessToken, timeRange, 10),
  ])
  return {
    topTracks,
    topArtists: rawArtistsToTopArtists(rawArtists),
    genreBreakdown: rawArtistsToGenreBreakdown(rawArtists),
  }
}

export async function getFullStatsForRefreshToken(
  refreshToken: string,
  timeRange: TimeRange = "short_term"
): Promise<SpotifyStats> {
  const accessToken = await refreshSpotifyAccessToken(refreshToken)
  return getPersonalStats(accessToken, timeRange)
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
    genres: [
      "k-pop", "korean pop", "k-rap", "korean r&b",
      "k-pop girl group", "k-pop boy group", "korean indie",
      "idol", "korean pop", "k-indie",
    ],
    label: "K-Pop Stan",
    emoji: "⭐",
    description: "You live for the choreos, the fancams, and the comebacks.",
    color: "#ff6eb4",
  },
  {
    genres: ["hip hop", "rap", "trap", "drill", "afrobeats", "afropop", "hip-hop"],
    label: "Rhythm Chaser",
    emoji: "🎤",
    description: "You feel the beat before you hear the melody.",
    color: "#f5a623",
  },
  {
    genres: ["indie", "indie pop", "indie rock", "lo-fi", "bedroom pop", "lo fi"],
    label: "Indie Explorer",
    emoji: "🌿",
    description: "You find gems before they blow up. Taste level: elite.",
    color: "#7ed321",
  },
  {
    genres: ["pop", "dance pop", "electropop", "synth-pop", "teen pop", "art pop"],
    label: "Pop Enthusiast",
    emoji: "✨",
    description: "Certified bop detector. You know every hook.",
    color: "#bd10e0",
  },
  {
    genres: ["r&b", "soul", "neo soul", "contemporary r&b", "urban contemporary"],
    label: "Soul Seeker",
    emoji: "🕯️",
    description: "You listen with your whole heart, every time.",
    color: "#e8734a",
  },
  {
    genres: ["rock", "alternative rock", "classic rock", "punk", "metal", "emo", "alternative"],
    label: "Rock Devotee",
    emoji: "🎸",
    description: "Volume up. Always. Guitar solos hit different for you.",
    color: "#d0021b",
  },
  {
    genres: ["electronic", "edm", "house", "techno", "ambient", "experimental", "electro"],
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

export const DEFAULT_PERSONALITY: ListenerPersonality = {
  label: "Genre Nomad",
  emoji: "🌍",
  description: "You defy categories. Your playlist is a world tour.",
  color: "#1DB954",
}

function genreSimilarity(a: string, b: string) {
  if (a === b) return 3
  if (a.includes(b) || b.includes(a)) return 1
  return 0
}

export function derivePersonality(
  genres: SpotifyGenre[],
  artists: SpotifyArtist[] = []
): ListenerPersonality {
  const allGenres = [
    ...new Set(
      artists.flatMap((a) =>
        (a.genres ?? []).map((g) => g.toLowerCase())
      )
    ),
  ]

  if (allGenres.length === 0) return DEFAULT_PERSONALITY

  let bestMatch = {
    personality: DEFAULT_PERSONALITY,
    score: 0,
  }

  for (const p of PERSONALITIES) {
    let score = 0

    for (const targetGenre of allGenres) {
      for (const personalityGenre of p.genres) {
        score += genreSimilarity(targetGenre, personalityGenre)
      }
    }

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
    Math.min(100, raw * 100 + sharedArtists.length * 5)
  )

  const { verdict, emoji } = VERDICTS.find((v) => score >= v.min)!
  return { score, sharedArtists, sharedGenres, verdict, verdictEmoji: emoji }
}