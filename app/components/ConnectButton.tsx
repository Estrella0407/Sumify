interface ConnectButtonProps {
  action: () => Promise<void>
  label?: string
}

export function ConnectButton({ action, label = "Connect Spotify" }: ConnectButtonProps) {
  return (
    <form action={action as unknown as string}>
      <button className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-emerald-400">
        {label}
      </button>
    </form>
  )
}
