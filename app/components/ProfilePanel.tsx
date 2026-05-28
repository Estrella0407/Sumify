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
    <section
      className="rounded-2xl border p-6 flex flex-col gap-6"
      style={{
        background: "#111",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      {/* User header */}
      <div className="flex items-center gap-4">
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? "avatar"}
            className="h-14 w-14 rounded-xl object-cover"
            style={{ border: "2px solid #1DB954" }}
          />
        ) : (
          <div
            className="h-14 w-14 rounded-xl flex items-center justify-center"
            style={{ background: "#1a1a1a" }}
          >
            <User className="h-6 w-6" style={{ color: "#666" }} />
          </div>
        )}
        <div>
          <p
            className="text-xs font-bold tracking-widest uppercase mb-1"
            style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
          >
            Your profile
          </p>
          <h2
            className="text-xl font-bold leading-tight"
            style={{ fontFamily: "Syne, sans-serif", color: "#f0f0f0" }}
          >
            {session.user?.name ?? "Connected User"}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "#555" }}>
            {session.user?.email ?? ""}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

      {/* Top tracks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
          >
            Top tracks
          </p>
          <span className="text-xs" style={{ color: "#444" }}>
            Last 4 weeks
          </span>
        </div>

        {tracks.length ? (
          <div className="flex flex-col gap-1">
            {tracks.map((track, index) => (
              <div
                key={track.name + index}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
                style={{ cursor: "default" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1a1a1a")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span
                  className="text-xs font-bold w-5 text-center shrink-0"
                  style={{ color: "#333", fontFamily: "Syne, sans-serif" }}
                >
                  {index + 1}
                </span>
                {track.albumArt ? (
                  <img
                    src={track.albumArt}
                    alt={track.name}
                    className="h-10 w-10 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "#1a1a1a" }}
                  >
                    <Music className="h-4 w-4" style={{ color: "#444" }} />
                  </div>
                )}
                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-medium"
                    style={{ color: "#e0e0e0" }}
                  >
                    {track.name}
                  </p>
                  <p className="truncate text-xs" style={{ color: "#555" }}>
                    {track.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: "#444" }}>
            No top tracks yet. Authorize Spotify to see your listening data.
          </p>
        )}
      </div>
    </section>
  )
}