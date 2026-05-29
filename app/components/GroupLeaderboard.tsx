import { BarChart2, TrendingUp, Users } from "lucide-react"
import type { SpotifyStats } from "../../types/spotify"

interface GroupLeaderboardProps {
  stats: SpotifyStats | null
}

function SectionCard({
  icon,
  label,
  title,
  children,
}: {
  icon: React.ReactNode
  label: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{ background: "#111", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(29,185,84,0.1)" }}
        >
          {icon}
        </div>
        <div>
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
          >
            {label}
          </p>
          <h2
            className="text-lg font-bold leading-tight"
            style={{ fontFamily: "Syne, sans-serif", color: "#f0f0f0" }}
          >
            {title}
          </h2>
        </div>
      </div>
      {children}
    </div>
  )
}

export function GroupLeaderboard({ stats }: GroupLeaderboardProps) {
  const topArtists = stats?.topArtists ?? []
  const genres = stats?.genreBreakdown ?? []

  return (
    <section className="flex flex-col gap-5">
      {/* Top artists */}
      <SectionCard
        icon={<TrendingUp className="h-4 w-4" style={{ color: "#1DB954" }} />}
        label="Top artists"
        title="Your most played artists"
      >
        {topArtists.length ? (
          <div className="flex flex-col gap-2">
            {topArtists.map((artist, index) => (
              <div
                key={artist.name}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "#151515" }}
              >
                <span
                  className="text-xs font-black w-6 shrink-0"
                  style={{
                    color: index === 0 ? "#1DB954" : "#333",
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  #{index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "#e0e0e0" }}>
                    {artist.name}
                  </p>
                  {artist.genres?.length > 0 && (
                    <p className="text-xs truncate" style={{ color: "#444" }}>
                      {artist.genres.slice(0, 2).join(", ")}
                    </p>
                  )}
                </div>
                {index === 0 && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-md shrink-0"
                    style={{
                      background: "rgba(29,185,84,0.12)",
                      color: "#1DB954",
                      fontFamily: "Syne, sans-serif",
                    }}
                  >
                    #1
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: "#444" }}>
            No top artists yet. Make sure Spotify is connected and try refreshing.
          </p>
        )}
      </SectionCard>

      {/* Genre breakdown */}
      <SectionCard
        icon={<BarChart2 className="h-4 w-4" style={{ color: "#1DB954" }} />}
        label="Genre breakdown"
        title="Your listening palette"
      >
        {genres.length ? (
          <div className="flex flex-col gap-4">
            {genres.map((genre, i) => (
              <div key={genre.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm capitalize" style={{ color: "#aaa" }}>
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
                  className="h-1.5 w-full rounded-full overflow-hidden"
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
          <p className="text-sm leading-relaxed" style={{ color: "#444" }}>
            No genre data returned. This can happen if your top artists don&apos;t have genre tags on Spotify yet.
          </p>
        )}
      </SectionCard>

      {/* Friends placeholder */}
      <SectionCard
        icon={<Users className="h-4 w-4" style={{ color: "#1DB954" }} />}
        label="Friends invited"
        title="Group session status"
      >
        <p className="text-sm" style={{ color: "#444" }}>
          Invite friends to connect their Spotify and appear here.
        </p>
      </SectionCard>
    </section>
  )
}