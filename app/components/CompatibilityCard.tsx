import type { CompatibilityResult, ListenerPersonality, SavedSpotifyUserWithTopTracks } from "../../types/spotify"
import { computeCompatibility } from "../../lib/spotify-final"
import { useCurrentUser } from "../../lib/current-user-provider"

interface CompatibilityCardProps {
  friend: SavedSpotifyUserWithTopTracks
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  return src ? (
    <img
      src={src}
      alt={name}
      className="h-12 w-12 rounded-xl object-cover shrink-0"
      style={{ border: "2px solid rgba(255,255,255,0.08)" }}
    />
  ) : (
    <div
      className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-base font-bold"
      style={{ background: "#1a1a1a", color: "#555", fontFamily: "Syne, sans-serif" }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
      <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1a1a1a" strokeWidth="7" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="text-2xl font-black leading-none"
          style={{ fontFamily: "Syne, sans-serif", color }}
        >
          {score}
        </span>
        <span className="text-xs" style={{ color: "#444" }}>
          %
        </span>
      </div>
    </div>
  )
}

export function CompatibilityCard({ friend }: CompatibilityCardProps) {
  const currentUser = useCurrentUser()
  if (currentUser.id && friend.spotifyId === currentUser.id) {
    return null
  }

  const result = computeCompatibility(
    { topArtists: currentUser.topArtists, genreBreakdown: currentUser.genreBreakdown },
    { topArtists: friend.topArtists, genreBreakdown: friend.genreBreakdown }
  )

  // Score color
  const scoreColor =
    result.score >= 65 ? "#1DB954" : result.score >= 40 ? "#f5a623" : "#e05a5a"

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-5"
      style={{ background: "#111", borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={currentUser.image} name={currentUser.name} />
          <span style={{ color: "#333", fontSize: 18 }}>×</span>
          <Avatar src={friend.image} name={friend.name} />
          <div className="min-w-0 ml-1">
            <p
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
            >
              Compatibility
            </p>
            <p className="text-sm font-semibold truncate" style={{ color: "#e0e0e0", fontFamily: "Syne, sans-serif" }}>
              You &amp; {friend.name.split(" ")[0]}
            </p>
          </div>
        </div>
        <ScoreRing score={result.score} color={scoreColor} />
      </div>

      {/* Verdict */}
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3"
        style={{ background: "#151515" }}
      >
        <span style={{ fontSize: 22 }}>{result.verdictEmoji}</span>
        <div>
          <p className="font-semibold text-sm" style={{ color: "#e0e0e0", fontFamily: "Syne, sans-serif" }}>
            {result.verdict}
          </p>
          <p className="text-xs" style={{ color: "#555" }}>
            Based on top artists &amp; genres
          </p>
        </div>
      </div>

      {/* Shared artists */}
      {result.sharedArtists.length > 0 && (
        <div>
          <p
            className="text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: "#444", fontFamily: "Syne, sans-serif" }}
          >
            Both listen to
          </p>
          <div className="flex flex-wrap gap-2">
            {result.sharedArtists.map((a) => (
              <span
                key={a}
                className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{
                  background: "rgba(29,185,84,0.1)",
                  color: "#1DB954",
                  border: "1px solid rgba(29,185,84,0.15)",
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Shared genres */}
      {result.sharedGenres.length > 0 && (
        <div>
          <p
            className="text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: "#444", fontFamily: "Syne, sans-serif" }}
          >
            Shared genres
          </p>
          <div className="flex flex-wrap gap-2">
            {result.sharedGenres.map((g) => (
              <span
                key={g}
                className="text-xs px-2.5 py-1 rounded-lg capitalize"
                style={{
                  background: "#1a1a1a",
                  color: "#666",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.sharedArtists.length === 0 && result.sharedGenres.length === 0 && (
        <p className="text-sm" style={{ color: "#444" }}>
          No overlapping artists or genres yet — truly different tastes!
        </p>
      )}
    </div>
  )
}