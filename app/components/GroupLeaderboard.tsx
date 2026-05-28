import { ChartBar, TrendingUp, Users } from "lucide-react"
import type { SpotifyStats } from "../../types/spotify"

const friendPlaceholders = [
  { name: "Friend #1", status: "Waiting to connect" },
  { name: "Friend #2", status: "Waiting to connect" },
]

interface GroupLeaderboardProps {
  stats: SpotifyStats | null
}

export function GroupLeaderboard({ stats }: GroupLeaderboardProps) {
  const topArtists = stats?.topArtists ?? []
  const genres = stats?.genreBreakdown ?? []

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg shadow-black/10">
        <div className="flex items-center gap-3 mb-6 text-neutral-300">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Group leaderboard</p>
            <h2 className="text-xl font-semibold text-white">Top artists across your crew</h2>
          </div>
        </div>

        {topArtists.length ? (
          <div className="space-y-4">
            {topArtists.map((artist, index) => (
              <div key={artist.name} className="flex items-center justify-between rounded-3xl bg-neutral-950/80 px-4 py-3">
                <div>
                  <p className="font-semibold text-white">{artist.name}</p>
                  <p className="text-sm text-neutral-500">Estimated listen count: {artist.plays}</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-neutral-400">
            Invite friends to authorize their Spotify accounts and fill this leaderboard with real group data.
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg shadow-black/10">
        <div className="flex items-center gap-3 mb-6 text-neutral-300">
          <ChartBar className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Genre breakdown</p>
            <h2 className="text-xl font-semibold text-white">Your listening palette</h2>
          </div>
        </div>

        {genres.length ? (
          <div className="space-y-3">
            {genres.map((genre) => (
              <div key={genre.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-neutral-400">
                  <span>{genre.name}</span>
                  <span>{genre.share}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-950">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${genre.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-neutral-400">
            Top genres will appear after Spotify sync. Invite friends to show a true group snapshot.
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg shadow-black/10">
        <div className="flex items-center gap-3 mb-6 text-neutral-300">
          <Users className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Friends invited</p>
            <h2 className="text-xl font-semibold text-white">Group session status</h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {friendPlaceholders.map((friend) => (
            <div key={friend.name} className="rounded-3xl border border-neutral-800 bg-neutral-950/70 p-4">
              <p className="text-sm font-semibold text-white">{friend.name}</p>
              <p className="text-sm text-neutral-500">{friend.status}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
