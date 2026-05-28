import { Music, User } from "lucide-react"
import type { Session } from "next-auth"
import type { SpotifyStats } from "../../types/spotify"

interface ProfilePanelProps {
  session: Session
  stats: SpotifyStats | null
}

export function ProfilePanel({ session, stats }: ProfilePanelProps) {
  const tracks = stats?.topTracks ?? []

  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg shadow-black/10">
      <div className="flex items-center gap-4 border-b border-neutral-800 pb-6 mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-300">
          <Music className="h-7 w-7" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Your Spotify Stats</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {session.user?.name ?? "Connected User"}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? "avatar"}
            className="h-12 w-12 rounded-full ring-2 ring-emerald-500"
          />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-full bg-neutral-800 text-neutral-400">
            <User className="h-6 w-6" />
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-white">
            {session.user?.email ?? "No email available"}
          </p>
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-400/80">Active session</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl bg-neutral-950/60 p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-neutral-500 mb-4">
            <span>Top tracks</span>
            <span>Monthly</span>
          </div>
          {tracks.length ? (
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <div key={track.name + index} className="group flex items-center gap-3 rounded-2xl bg-neutral-900 p-3 transition hover:bg-neutral-800">
                  {track.albumArt ? (
                    <img src={track.albumArt} alt={track.name} className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-neutral-800 text-neutral-500">
                      <Music className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{track.name}</p>
                    <p className="truncate text-sm text-neutral-400">{track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-neutral-400">
              No top tracks available yet. Refresh after Spotify authorization and invite friends to build the group leaderboard.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
