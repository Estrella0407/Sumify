import { Music, User } from "lucide-react"
import type { Session } from "next-auth"
import type { SpotifyStats } from "../../types/spotify"

interface ProfilePanelProps {
  session: Session
  stats: SpotifyStats | null
}

export function ProfilePanel({ session, stats }: ProfilePanelProps) {
  const tracks = stats?.topTracks ?? []
  const artists = stats?.topArtists ?? []
  const genres = stats?.genreBreakdown ?? []

  return (
    <section className="flex flex-col gap-5">
      {/* User header */}
      <div
        className="rounded-2xl border p-5 flex items-center gap-4"
        style={{ background: "#111", borderColor: "rgba(255,255,255,0.07)" }}
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? "avatar"}
            className="h-14 w-14 rounded-xl object-cover shrink-0"
            style={{ border: "2px solid #1DB954" }}
          />
        ) : (
          <div
            className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#1a1a1a" }}
          >
            <User className="h-6 w-6" style={{ color: "#555" }} />
          </div>
        )}
        <div className="min-w-0">
          <p
            className="text-xs font-bold tracking-widest uppercase mb-1"
            style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
          >
            Your profile
          </p>
          <h2
            className="text-xl font-bold leading-tight truncate"
            style={{ fontFamily: "Syne, sans-serif", color: "#f0f0f0" }}
          >
            {session.user?.name ?? "Connected User"}
          </h2>
          <p className="text-xs mt-0.5 truncate" style={{ color: "#444" }}>
            {session.user?.email ?? ""}
          </p>
        </div>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Top Tracks */}
        <div
          className="rounded-2xl border p-4 flex flex-col gap-3"
          style={{ background: "#111", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
          >
            Top tracks
          </p>

          {tracks.length ? (
            <div className="flex flex-col gap-1.5">
              {tracks.map((track, index) => (
                <div
                  key={track.name + index}
                  className="flex items-center gap-2.5 rounded-xl p-2"
                  style={{ background: "#151515" }}
                >
                  <span
                    className="text-xs w-4 text-center shrink-0"
                    style={{ color: "#333", fontFamily: "Syne, sans-serif" }}
                  >
                    {index + 1}
                  </span>
                  {track.albumArt ? (
                    <img
                      src={track.albumArt}
                      alt={track.name}
                      className="h-9 w-9 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "#1a1a1a" }}
                    >
                      <Music className="h-3.5 w-3.5" style={{ color: "#444" }} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium" style={{ color: "#e0e0e0" }}>
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
            <p className="text-xs leading-relaxed" style={{ color: "#444" }}>
              No top tracks yet.
            </p>
          )}
        </div>

        {/* Top Artists */}
        <div
          className="rounded-2xl border p-4 flex flex-col gap-3"
          style={{ background: "#111", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
          >
            Top artists
          </p>

          {artists.length ? (
            <div className="flex flex-col gap-1.5">
              {artists.map((artist, index) => (
                <div
                  key={artist.name}
                  className="flex items-center gap-2.5 rounded-xl p-2"
                  style={{ background: "#151515" }}
                >
                  <span
                    className="text-xs font-black w-4 shrink-0 text-center"
                    style={{
                      color: index === 0 ? "#1DB954" : "#333",
                      fontFamily: "Syne, sans-serif",
                    }}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium" style={{ color: "#e0e0e0" }}>
                      {artist.name}
                    </p>
                    {artist.genres?.length > 0 && (
                      <p className="truncate text-xs capitalize" style={{ color: "#555" }}>
                        {artist.genres.slice(0, 2).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs leading-relaxed" style={{ color: "#444" }}>
              No top artists yet.
            </p>
          )}
        </div>

        {/* Genre Breakdown */}
        <div
          className="rounded-2xl border p-4 flex flex-col gap-3"
          style={{ background: "#111", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
          >
            Genres
          </p>

          {genres.length ? (
            <div className="flex flex-col gap-3">
              {genres.map((genre, i) => (
                <div key={genre.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs capitalize" style={{ color: "#aaa" }}>
                      {genre.name}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
                    >
                      {genre.share}%
                    </span>
                  </div>
                  <div
                    className="h-1 w-full rounded-full overflow-hidden"
                    style={{ background: "#1a1a1a" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${genre.share}%`,
                        background:
                          i === 0
                            ? "linear-gradient(90deg, #1DB954, #1ed760)"
                            : `rgba(29,185,84,${0.7 - i * 0.1})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs leading-relaxed" style={{ color: "#444" }}>
              No genre data yet. Fetched from Last.fm.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}