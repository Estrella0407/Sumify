import { Suspense } from "react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { CurrentUserProvider } from "../lib/current-user-provider"
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
        {/* Top bar */}
        <header className="flex items-center justify-between mb-10">
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
          >
            Sumify
          </p>
          {session && (
            <Link
              href="/settings"
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              title="Settings"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#666" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </Link>
          )}
        </header>

        {session && myProfile ? (
          <CurrentUserProvider value={myProfile}>
            <>
              {/* Page title */}
              <div className="mb-8">
                <h1
                  className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-3"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Compare music{" "}
                  <span style={{ color: "#1DB954" }}>tastes</span>.
                </h1>
                <p className="text-sm" style={{ color: "#555" }}>
                  Your listening data, your crew's — side by side.
                </p>
              </div>

              {/* Time range + personality row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                {myPersonality && (
                  <PersonalityBadge personality={myPersonality} name={session.user?.name ?? "You"} compact />
                )}
                <div className="flex items-center gap-3 sm:ml-auto">
                  <p className="text-xs" style={{ color: "#444" }}>
                    {RANGE_LABELS[timeRange]}
                  </p>
                  <Suspense>
                    <TimeRangeFilter />
                  </Suspense>
                </div>
              </div>

              {/* ── Profile panel — full width, 3 columns inside ── */}
              <ProfilePanel session={session} stats={stats} />

              {/* ── Group session + comparisons ── */}
              <div className="mt-8 flex flex-col gap-8">

                {/* Connected members */}
                <GroupLeaderboard
                  savedUsers={savedUserColumns}
                />

                {/* Compatibility */}
                {myProfile && savedUserColumns.some((u) => !u.error) && (
                  <div>
                    <div className="mb-4">
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
                            friend={friend}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Friend columns */}
                {savedUserColumns.length > 0 && (
                  <div>
                    <div className="mb-4">
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
                                    <p className="truncate text-sm font-medium" style={{ color: "#ccc" }}>
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
                )}
              </div>
            </>
          </CurrentUserProvider>
        ) : (
          /* Landing */
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <div
              className="h-20 w-20 rounded-2xl mb-8 flex items-center justify-center"
              style={{ background: "rgba(29,185,84,0.1)" }}
            >
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="#1DB954">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </div>
            <p
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
            >
              Sumify
            </p>
            <h1
              className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-4 max-w-xl"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Your music,
              <br />
              <span style={{ color: "#1DB954" }}>ranked.</span>
            </h1>
            <p
              className="text-sm leading-relaxed mb-10 max-w-sm"
              style={{ color: "#555" }}
            >
              Connect Spotify to discover your listener personality and compare music taste with friends.
            </p>
            <ConnectButton href="/api/auth/signin/spotify" />
          </div>
        )}
      </div>
    </main>
  )
}