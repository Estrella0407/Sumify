import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import {
  getPersonalStats,
  getFullStatsForRefreshToken,
  derivePersonality,
  DEFAULT_PERSONALITY,
  type TimeRange,
} from "../lib/spotify-final"
import { getSavedSpotifyUsers } from "../lib/db"
import { ConnectButton } from "./components/ConnectButton"
import { GroupLeaderboard } from "./components/GroupLeaderboard"
import { ProfilePanel } from "./components/ProfilePanel"
import { CompatibilityCard } from "./components/CompatibilityCard"
import { PersonalityBadge } from "./components/PersonalityBadge"
import { TimeRangeFilter } from "./components/TimeRangeFilter"
import type {
  SavedSpotifyUser,
  SavedSpotifyUserWithTopTracks,
  SpotifyStats,
} from "../types/spotify"

const RANGE_LABELS: Record<TimeRange, string> = {
  short_term: "Last 4 weeks",
  medium_term: "Last 6 months",
  long_term: "All time",
}

function isValidRange(value: string | undefined): value is TimeRange {
  return value === "short_term" || value === "medium_term" || value === "long_term"
}

export const dynamic = "force-dynamic"

export default async function Home({
  searchParams,
}: {
  searchParams: { range?: string }
}) {
  const timeRange: TimeRange = isValidRange(searchParams.range)
    ? searchParams.range
    : "short_term"

  const session = await getServerSession(authOptions)
  const accessToken = (session as any)?.accessToken as string | undefined

  const stats: SpotifyStats | null = accessToken
    ? await getPersonalStats(accessToken, timeRange).catch(() => null)
    : null

  const savedUsers: SavedSpotifyUser[] = await getSavedSpotifyUsers().catch(() => [])

  const savedUserColumns: SavedSpotifyUserWithTopTracks[] = await Promise.all(
    savedUsers.map(async (user) => {
      try {
        const fullStats = await getFullStatsForRefreshToken(user.refreshToken, timeRange)
        const personality = derivePersonality(fullStats.genreBreakdown, fullStats.topArtists)
        return {
          ...user,
          topTracks: fullStats.topTracks,
          topArtists: fullStats.topArtists,
          genreBreakdown: fullStats.genreBreakdown,
          personality,
        }
      } catch (e) {
          console.error("Failed to load stats for", user.name, e)
        return {
          ...user,
          topTracks: [],
          topArtists: [],
          genreBreakdown: [],
          personality: DEFAULT_PERSONALITY,
          error: "Unable to load tracks. Token may need refresh.",
        }
      }
    })
  )

  const myPersonality = stats
    ? derivePersonality(stats.genreBreakdown, stats.topArtists)
    : null

  const myProfile =
    stats && session
      ? {
          name: session.user?.name ?? "You",
          image: session.user?.image ?? null,
          topArtists: stats.topArtists,
          genreBreakdown: stats.genreBreakdown,
          personality: myPersonality!,
        }
      : null

  return (
    <main className="min-h-screen relative" style={{ background: "#0a0a0a", color: "#f0f0f0" }}>
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "-30vh",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70vw",
          height: "60vh",
          background: "radial-gradient(ellipse, rgba(29,185,84,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        className="relative max-w-6xl mx-auto px-5 py-10 md:px-10 md:py-14"
        style={{ zIndex: 1 }}
      >
        {/* Header */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-10">
          <div>
            <p
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
            >
              Sumify
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none"
              style={{ fontFamily: "Syne, sans-serif", color: "#f0f0f0" }}
            >
              Compare music
              <br />
              <span style={{ color: "#1DB954" }}>tastes</span> with friends.
            </h1>
            <p className="mt-4 text-sm leading-relaxed max-w-md" style={{ color: "#555" }}>
              Connect Spotify, discover your listener personality, and see how compatible your taste
              is with friends.
            </p>
          </div>

          {session ? (
            <a
              href="/api/auth/signout"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium self-start sm:self-auto"
              style={{
                background: "#1a1a1a",
                color: "#666",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              Disconnect Spotify
            </a>
          ) : (
            <ConnectButton href="/api/auth/signin/spotify" />
          )}
        </header>

        {session ? (
          <>
            {/* TEMPORARY DEBUG - remove after checking */}
            {stats && (
              <pre style={{ color: "lime", fontSize: 10, padding: 16, overflowX: "auto", background: "#111", marginBottom: 16 }}>
                {JSON.stringify({
                  genres: stats.genreBreakdown,
                  artists: stats.topArtists.map(a => ({ name: a.name, genres: a.genres }))
                }, null, 2)}
              </pre>
            )}

            {/* Time range filter + label */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
              <p className="text-sm" style={{ color: "#444" }}>
                Showing data for{" "}
                <span style={{ color: "#e0e0e0" }}>{RANGE_LABELS[timeRange]}</span>
              </p>
              <Suspense>
                <TimeRangeFilter />
              </Suspense>
            </div>

            {/* Personality */}
            {myPersonality && (
              <div className="mb-8">
                <PersonalityBadge personality={myPersonality} name={session.user?.name ?? "You"} />
              </div>
            )}

            {/* Stats grid */}
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <ProfilePanel session={session} stats={stats} />
              <GroupLeaderboard stats={stats} />
            </div>

            {/* Friends */}
            {savedUserColumns.length > 0 && (
              <section className="mt-12 flex flex-col gap-12">
                {/* Compatibility */}
                {myProfile && savedUserColumns.some((u) => !u.error) && (
                  <div>
                    <div className="mb-5">
                      <p
                        className="text-xs font-bold tracking-widest uppercase mb-1"
                        style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
                      >
                        Music compatibility
                      </p>
                      <h2
                        className="text-2xl font-bold"
                        style={{ fontFamily: "Syne, sans-serif" }}
                      >
                        How do you match up?
                      </h2>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {savedUserColumns
                        .filter((u) => !u.error)
                        .map((friend) => (
                          <CompatibilityCard
                            key={friend.spotifyId}
                            currentUser={myProfile}
                            friend={friend}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Friend columns */}
                <div>
                  <div className="mb-5">
                    <p
                      className="text-xs font-bold tracking-widest uppercase mb-1"
                      style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
                    >
                      Connected friends
                    </p>
                    <h2
                      className="text-2xl font-bold"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      Top tracks for every user
                    </h2>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {savedUserColumns.map((user) => (
                      <article
                        key={user.spotifyId}
                        className="rounded-2xl border p-5 flex flex-col gap-4"
                        style={{ background: "#111", borderColor: "rgba(255,255,255,0.07)" }}
                      >
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="h-11 w-11 rounded-xl object-cover shrink-0"
                            />
                          ) : (
                            <div
                              className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                              style={{ background: "#1a1a1a", color: "#333" }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p
                              className="font-semibold truncate"
                              style={{ color: "#e0e0e0", fontFamily: "Syne, sans-serif" }}
                            >
                              {user.name}
                            </p>
                            <p className="text-xs" style={{ color: "#444" }}>
                              {RANGE_LABELS[timeRange]}
                            </p>
                          </div>
                        </div>

                        {!user.error && (
                          <PersonalityBadge
                            personality={user.personality}
                            name={user.name}
                            compact
                          />
                        )}

                        {user.error ? (
                          <p className="text-sm" style={{ color: "#c0392b" }}>
                            {user.error}
                          </p>
                        ) : user.topTracks.length ? (
                          <div className="flex flex-col gap-1">
                            {user.topTracks.map((track, index) => (
                              <div
                                key={`${user.spotifyId}-${track.name}-${index}`}
                                className="flex items-center gap-2.5 rounded-lg px-2 py-2"
                                style={{ background: "#151515" }}
                              >
                                <span
                                  className="text-xs w-4 shrink-0 text-center"
                                  style={{ color: "#333", fontFamily: "Syne, sans-serif" }}
                                >
                                  {index + 1}
                                </span>
                                <div className="min-w-0">
                                  <p
                                    className="truncate text-sm font-medium"
                                    style={{ color: "#ccc" }}
                                  >
                                    {track.name}
                                  </p>
                                  <p className="truncate text-xs" style={{ color: "#444" }}>
                                    {track.artist}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm" style={{ color: "#444" }}>
                            No saved top tracks yet.
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        ) : (
          <div
            className="rounded-2xl border p-12 text-center max-w-2xl mx-auto mt-10"
            style={{ background: "#111", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div
              className="h-16 w-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: "rgba(29,185,84,0.1)" }}
            >
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="#1DB954">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </div>
            <p
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
            >
              Get started
            </p>
            <h2
              className="text-3xl font-black mb-3"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Your music, ranked.
            </h2>
            <p
              className="text-sm leading-relaxed mb-8 max-w-sm mx-auto"
              style={{ color: "#555" }}
            >
              Connect Spotify to discover your listener personality and compare music taste with
              friends.
            </p>
            <ConnectButton href="/api/auth/signin/spotify" />
          </div>
        )}
      </div>
    </main>
  )
}