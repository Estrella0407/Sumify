import { auth, signIn, signOut } from "../lib/auth"
import { getPersonalStats, getTopTracksForRefreshToken } from "../lib/spotify"
import { getSavedSpotifyUsers } from "../lib/db"
import { ConnectButton } from "./components/ConnectButton"
import { GroupLeaderboard } from "./components/GroupLeaderboard"
import { ProfilePanel } from "./components/ProfilePanel"
import type {
  SavedSpotifyUser,
  SavedSpotifyUserWithTopTracks,
  SpotifyStats,
} from "../types/spotify"

async function login() {
  "use server"
  await signIn("spotify")
}

async function logout() {
  "use server"
  await signOut()
}

export default async function Home() {
  const session = await auth()
  const stats: SpotifyStats | null = session?.accessToken ? await getPersonalStats(session.accessToken) : null
  const savedUsers: SavedSpotifyUser[] = await getSavedSpotifyUsers()

  const savedUserColumns: SavedSpotifyUserWithTopTracks[] = await Promise.all(
    savedUsers.map(async (user) => {
      try {
        const topTracks = await getTopTracksForRefreshToken(user.refreshToken)
        return { ...user, topTracks }
      } catch (error) {
        return {
          ...user,
          topTracks: [],
          error: "Unable to load saved user tracks. Token may need refresh.",
        }
      }
    })
  )

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800 pb-8 mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-400/80 font-semibold mb-3">
              Sumify Group Leaderboard
            </p>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              Compare music tastes with friends.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400">
              Connect Spotify, store refresh tokens in Supabase, and view all saved users’ top tracks in columns.
            </p>
          </div>

          {session ? (
            <form action={logout}>
              <button className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700">
                Disconnect Spotify
              </button>
            </form>
          ) : (
            <ConnectButton action={login} />
          )}
        </header>

        {session ? (
          <>
            <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
              <ProfilePanel session={session} stats={stats} />
              <GroupLeaderboard stats={stats} />
            </div>

            <section className="mt-10 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-emerald-400/80 font-semibold">
                    Saved group columns
                  </p>
                  <h2 className="text-3xl font-bold text-white">Top tracks for every connected user</h2>
                </div>
              </div>

              {savedUserColumns.length ? (
                <div className="grid gap-6 xl:grid-cols-3">
                  {savedUserColumns.map((user) => (
                    <article key={user.spotifyId} className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg shadow-black/10">
                      <div className="flex items-center gap-4 mb-6">
                        {user.image ? (
                          <img src={user.image} alt={user.name} className="h-14 w-14 rounded-2xl object-cover" />
                        ) : (
                          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-neutral-800 text-neutral-400">U</div>
                        )}
                        <div>
                          <p className="text-lg font-semibold text-white">{user.name}</p>
                          <p className="text-sm text-neutral-500">Saved Spotify token</p>
                        </div>
                      </div>

                      {user.error ? (
                        <p className="text-sm text-red-400">{user.error}</p>
                      ) : (
                        <div className="space-y-4">
                          {user.topTracks.length ? (
                            user.topTracks.map((track, index) => (
                              <div key={`${user.spotifyId}-${track.name}-${index}`} className="rounded-3xl bg-neutral-950 p-3">
                                <p className="text-sm font-semibold text-white truncate">{track.name}</p>
                                <p className="text-xs text-neutral-500 truncate">{track.artist}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm leading-6 text-neutral-400">
                              No saved top tracks available for this user yet.
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-8 text-center">
                  <p className="text-sm text-neutral-400">
                    No saved Spotify refresh tokens found yet. Have friends sign in so their tokens are stored and displayed.
                  </p>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-12 text-center shadow-xl shadow-black/30">
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-400/80 mb-4">No account connected yet</p>
            <h2 className="text-3xl font-bold text-white mb-4">Start your group listening leaderboard.</h2>
            <p className="mx-auto max-w-xl text-sm leading-7 text-neutral-400 mb-8">
              Connect your Spotify account to see your top tracks, top artists, and genre breakdown. Invite friends to build a shared music leaderboard.
            </p>
            <ConnectButton action={login} />
          </div>
        )}
      </div>
    </main>
  )
}
