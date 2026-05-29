import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false } }
)

const blockedGenres = new Set([
  "seen live",
  "favorites",
  "favorite",
  "female vocalists",
  "male vocalists",
  "british",
  "american",
])

function normalizeGenre(raw: string): string {
  const g = raw
    .trim()
    .toLowerCase()
    .replace(/[_]/g, " ")
    .replace(/\s+/g, " ")

  const aliases: Record<string, string> = {
    "kpop": "k-pop",
    "k pop": "k-pop",
    "k-pop": "k-pop",
    "korean pop": "k-pop",

    "jpop": "j-pop",
    "j pop": "j-pop",
    "j-pop": "j-pop",
    "japanese pop": "j-pop",

    "hip hop": "hip-hop",
    "hiphop": "hip-hop",

    "r&b": "rnb",
    "rhythm and blues": "rnb",
  }

  return aliases[g] || g
}

function normalizeGenres(genres: string[]): string[] {
  return [...new Set(genres.map(normalizeGenre))]
}

// ── Cache ──────────────────────────────────────────────────────────────────────

async function getCachedGenres(artistName: string): Promise<string[] | null> {
  try {
    const { data } = await supabase
      .from("artist_genres")
      .select("genres, fetched_at")
      .eq("artist_name", artistName.toLowerCase())
      .single()

    if (!data) return null

    // Cache valid for 7 days
    const age = Date.now() - new Date(data.fetched_at).getTime()
    if (age > 7 * 24 * 60 * 60 * 1000) return null

    return data.genres as string[]
  } catch {
    return null
  }
}

async function setCachedGenres(artistName: string, genres: string[]): Promise<void> {
  try {
    await supabase.from("artist_genres").upsert(
      {
        artist_name: artistName.toLowerCase(),
        genres,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "artist_name" }
    )
  } catch (e) {
    console.error("Failed to cache genres for", artistName, e)
  }
}

// ── Last.fm ────────────────────────────────────────────────────────────────────

async function getGenresFromLastFm(artistName: string): Promise<string[]> {
  const apiKey = process.env.LASTFM_API_KEY
  if (!apiKey) return []

  const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(
    artistName
  )}&api_key=${apiKey}&format=json`

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) return []

  const data = await res.json()
  const tags = data?.artist?.tags?.tag ?? []

  return normalizeGenres(
    (tags as Array<{ name: string }>)
      .map((t) => t.name)
  )
  .filter((g) => !blockedGenres.has(g))
  .slice(0, 5)
}

// ── TheAudioDB ─────────────────────────────────────────────────────────────────

async function getGenresFromAudioDB(artistName: string): Promise<string[]> {
  const url = `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(
    artistName
  )}`

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) return []

  const data = await res.json()
  const artist = data?.artists?.[0]
  if (!artist) return []

  const genres: string[] = []
  if (artist.strGenre) genres.push(artist.strGenre.toLowerCase())
  if (artist.strStyle) genres.push(artist.strStyle.toLowerCase())
  if (artist.strMood) genres.push(artist.strMood.toLowerCase())

  return normalizeGenres(genres).slice(0, 5)
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getArtistGenres(artistName: string): Promise<string[]> {
  // 1. Check cache
  const cached = await getCachedGenres(artistName)
  if (cached && cached.length > 0) return cached

  // 2. Try Last.fm
  let genres = await getGenresFromLastFm(artistName)

  // 3. Fallback to TheAudioDB
  if (genres.length === 0) {
    genres = await getGenresFromAudioDB(artistName)
  }

  // 4. Save to cache (even empty to avoid re-fetching unknown artists)
  await setCachedGenres(artistName, genres)

  return genres
}

/** Resolves genres for multiple artists in parallel */
export async function enrichArtistsWithExternalGenres(
  artists: Array<{ name: string; genres: string[] }>
): Promise<Array<{ name: string; genres: string[] }>> {
  return Promise.all(
    artists.map(async (artist) => {
      if (artist.genres.length > 0) return artist // already has genres from Spotify
      const genres = await getArtistGenres(artist.name)
      return { ...artist, genres }
    })
  )
}
