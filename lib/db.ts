import { createClient } from "@supabase/supabase-js"
import type { SavedSpotifyUser } from "../types/spotify"

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      persistSession: false,
    },
  }
)

export async function saveSpotifyUser(user: SavedSpotifyUser) {
  const { error } = await supabaseAdmin
    .from("spotify_users")
    .upsert(
      {
        spotify_id: user.spotifyId,
        email: user.email,
        name: user.name,
        image: user.image,
        refresh_token: user.refreshToken,
      },
      { onConflict: "spotify_id" }
    )

  if (error) {
    throw error
  }

  return user
}

export async function getSavedSpotifyUsers(): Promise<SavedSpotifyUser[]> {
  const { data, error } = await supabaseAdmin
    .from("spotify_users")
    .select("spotify_id, email, name, image, refresh_token")
    .order("updated_at", { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as SavedSpotifyUser[]
}
