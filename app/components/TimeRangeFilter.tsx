"use client"

import { useRouter, useSearchParams } from "next/navigation"

const RANGES = [
  { value: "short_term", label: "4 weeks" },
  { value: "medium_term", label: "6 months" },
  { value: "long_term", label: "All time" },
] as const

export function TimeRangeFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get("range") ?? "short_term"

  return (
    <div
      className="inline-flex items-center rounded-xl p-1 gap-1"
      style={{ background: "#151515", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {RANGES.map((r) => {
        const active = current === r.value
        return (
          <button
            key={r.value}
            onClick={() => router.push(`?range=${r.value}`)}
            className="rounded-lg px-4 py-1.5 text-xs font-bold transition-all"
            style={{
              fontFamily: "Syne, sans-serif",
              background: active ? "#1DB954" : "transparent",
              color: active ? "#000" : "#555",
              letterSpacing: "0.04em",
            }}
          >
            {r.label}
          </button>
        )
      })}
    </div>
  )
}