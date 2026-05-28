interface ConnectButtonProps {
  href: string
  label?: string
}

export function ConnectButton({ href, label = "Connect Spotify" }: ConnectButtonProps) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-emerald-400"
    >
      {label}
    </a>
  )
}
