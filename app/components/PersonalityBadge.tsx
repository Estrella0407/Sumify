import type { ListenerPersonality } from "../../types/spotify"

interface PersonalityBadgeProps {
  personality: ListenerPersonality
  name: string
  compact?: boolean
}

export function PersonalityBadge({ personality, name, compact = false }: PersonalityBadgeProps) {
  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5"
        style={{
          background: `${personality.color}18`,
          border: `1px solid ${personality.color}30`,
        }}
      >
        <span style={{ fontSize: 14 }}>{personality.emoji}</span>
        <span
          className="text-xs font-bold"
          style={{ color: personality.color, fontFamily: "Syne, sans-serif" }}
        >
          {personality.label}
        </span>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: "#111",
        borderColor: "rgba(255,255,255,0.07)",
        borderLeftWidth: 3,
        borderLeftColor: personality.color,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: `${personality.color}18` }}
        >
          {personality.emoji}
        </div>
        <div>
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: personality.color, fontFamily: "Syne, sans-serif" }}
          >
            Listener type
          </p>
          <p
            className="text-lg font-black leading-tight"
            style={{ fontFamily: "Syne, sans-serif", color: "#f0f0f0" }}
          >
            {personality.label}
          </p>
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "#666" }}>
        {personality.description}
      </p>
    </div>
  )
}