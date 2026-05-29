"use client"

import { Users } from "lucide-react"
import type { SavedSpotifyUserWithTopTracks } from "../../types/spotify"
import { useCurrentUser } from "../../lib/current-user-provider"

interface GroupLeaderboardProps {
  savedUsers?: SavedSpotifyUserWithTopTracks[]
  currentUserName?: string
  currentUserImage?: string | null
}

export function GroupLeaderboard({
  savedUsers = [],
}: GroupLeaderboardProps) {
  const currentUser = useCurrentUser()
  const connectedUsers = savedUsers.filter(
    (u) =>
      !u.error &&
      u.spotifyId !== currentUser?.id
  )
  const totalMembers = connectedUsers.length + 1

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
          <Users className="h-4 w-4" style={{ color: "#1DB954" }} />
        </div>
        <div>
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#1DB954", fontFamily: "Syne, sans-serif" }}
          >
            Group session
          </p>
          <h2
            className="text-lg font-bold leading-tight"
            style={{ fontFamily: "Syne, sans-serif", color: "#f0f0f0" }}
          >
            Connected members
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* Current user */}
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: "#151515" }}
        >
          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: "#1DB954" }} />
          {currentUser?.image ? (
            <img
              src={currentUser.image}
              alt={currentUser.name ?? "You"}
              className="h-7 w-7 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
              style={{ background: "#222", color: "#555" }}
            >
              {currentUser.name?.charAt(0).toUpperCase() ?? "Y"}
            </div>
          )}
          <p className="text-sm font-medium flex-1 truncate" style={{ color: "#e0e0e0" }}>
            {currentUser.name ?? "You"}
          </p>
          <span
            className="text-xs px-2 py-0.5 rounded-md font-bold shrink-0"
            style={{
              background: "rgba(29,185,84,0.1)",
              color: "#1DB954",
              fontFamily: "Syne, sans-serif",
            }}
          >
            You
          </span>
        </div>

        {/* Friends */}
        {connectedUsers.map((user) => (
          <div
            key={user.spotifyId}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "#151515" }}
          >
            <div className="h-2 w-2 rounded-full shrink-0" style={{ background: "#1DB954" }} />
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-7 w-7 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                style={{ background: "#222", color: "#444" }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-sm font-medium flex-1 truncate" style={{ color: "#ccc" }}>
              {user.name}
            </p>
            <span
              className="text-xs px-2 py-0.5 rounded-md shrink-0"
              style={{
                background: "#1a1a1a",
                color: "#444",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {user.personality?.emoji ?? "🎵"}
            </span>
          </div>
        ))}

        {/* Empty state */}
        {connectedUsers.length === 0 && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{
              background: "#151515",
              border: "1px dashed rgba(255,255,255,0.05)",
            }}
          >
            <div className="h-2 w-2 rounded-full shrink-0" style={{ background: "#2a2a2a" }} />
            <p className="text-sm" style={{ color: "#333" }}>
              Waiting for friends to connect...
            </p>
          </div>
        )}

        <p className="text-xs mt-2 text-right" style={{ color: "#2a2a2a" }}>
          {totalMembers} member{totalMembers !== 1 ? "s" : ""} in session
        </p>
      </div>
    </div>
  )
}