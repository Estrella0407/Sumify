# Sumify

A clean Spotify group leaderboard app built with the Next.js app router.

## Project structure

- `app/layout.tsx` — Root layout and metadata.
- `app/page.tsx` — Landing page with login and dashboard.
- `app/components/ConnectButton.tsx` — Spotify connect CTA.
- `app/components/ProfilePanel.tsx` — Personal stats panel.
- `app/components/GroupLeaderboard.tsx` — Aggregated leaderboard and friend placeholders.
- `app/api/auth/[...nextauth]/route.ts` — NextAuth auth route.
- `lib/auth.ts` — NextAuth Spotify provider config.
- `lib/spotify.ts` — Spotify data fetching helpers.
- `types/spotify.ts` — Shared Spotify model definitions.

## Environment variables

Create a `.env.local` file with:

```env
AUTH_SPOTIFY_ID=your_spotify_client_id
AUTH_SPOTIFY_SECRET=your_spotify_client_secret
NEXTAUTH_SECRET=your_random_secret
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

You also need a Supabase table named `spotify_users` with at least:
- `spotify_id` (primary key)
- `name`
- `email`
- `image`
- `refresh_token`
- `updated_at`

## Run locally

Install dependencies and start the app:

```bash
npm install
npm run dev
```
