import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/")

  return (
    <main
      className="min-h-screen relative"
      style={{ background: "#0a0a0a", color: "#f0f0f0" }}
    >
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
        className="relative max-w-2xl mx-auto px-5 py-10 md:px-10 md:py-14"
        style={{ zIndex: 1 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/"
            className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#666" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <p
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
            >
              Sumify
            </p>
            <h1
              className="text-2xl font-black"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Settings
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Account section */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: "#111", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <p
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
            >
              Account
            </p>

            <div className="flex items-center gap-4 mb-5">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "avatar"}
                  className="h-14 w-14 rounded-xl object-cover"
                  style={{ border: "2px solid rgba(255,255,255,0.08)" }}
                />
              ) : (
                <div
                  className="h-14 w-14 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ background: "#1a1a1a", color: "#555" }}
                >
                  {session.user?.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
              )}
              <div>
                <p className="font-semibold" style={{ color: "#e0e0e0", fontFamily: "Syne, sans-serif" }}>
                  {session.user?.name ?? "Unknown"}
                </p>
                <p className="text-sm" style={{ color: "#555" }}>
                  {session.user?.email ?? "No email"}
                </p>
                <div
                  className="inline-flex items-center gap-1.5 mt-1.5 rounded-lg px-2 py-0.5"
                  style={{ background: "rgba(29,185,84,0.1)" }}
                >
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#1DB954" }} />
                  <span className="text-xs font-medium" style={{ color: "#1DB954" }}>
                    Spotify connected
                  </span>
                </div>
              </div>
            </div>

            <a
              href="/api/auth/signout"
              className="flex items-center gap-3 rounded-xl px-4 py-3 w-full transition-colors"
              style={{
                background: "#151515",
                border: "1px solid rgba(255,255,255,0.05)",
                color: "#e05a5a",
              }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-medium">Disconnect Spotify</span>
            </a>
          </div>

          {/* Data section */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: "#111", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <p
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
            >
              Data
            </p>
            <div className="flex flex-col gap-2">
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: "#151515" }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "#ccc" }}>
                    Stats time range
                  </p>
                  <p className="text-xs" style={{ color: "#444" }}>
                    Change via the filter on the main page
                  </p>
                </div>
                <Link
                  href="/"
                  className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{
                    background: "rgba(29,185,84,0.1)",
                    color: "#1DB954",
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  Go back
                </Link>
              </div>

              <div
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: "#151515" }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "#ccc" }}>
                    Genre cache
                  </p>
                  <p className="text-xs" style={{ color: "#444" }}>
                    Artist genres cached for 7 days via Last.fm
                  </p>
                </div>
                <span className="text-xs" style={{ color: "#333" }}>
                  Auto
                </span>
              </div>
            </div>
          </div>

          {/* About section */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: "#111", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <p
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
            >
              About
            </p>
            <div className="flex flex-col gap-1 text-sm" style={{ color: "#555" }}>
              <p>Sumify uses the Spotify API for listening data,</p>
              <p>Last.fm for genre enrichment, and Supabase</p>
              <p>to store friend tokens and genre cache.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}