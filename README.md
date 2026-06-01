# ClearDeck

**Clear your deck. Ship your work.**

ClearDeck is a self-hostable, GTD-inspired task manager built with Next.js and Supabase. Capture tasks in Inbox, organize projects, plan with Forecast, and build custom perspectives — with multi-user auth and row-level security out of the box.

## Features

- **Inbox** — quick capture without assigning a project
- **Projects** — folders, sequential/parallel/single-action project types
- **Tags** — hierarchical tags for context
- **Forecast** — defer, due, and planned dates in a timeline view
- **Flagged & Review** — focus on priorities and weekly project reviews
- **Custom Perspectives** — saved filters with grouping and sorting
- **Dark mode** — system-aware theming
- **PWA** — installable progressive web app
- **Export / Import** — JSON backup and restore
- **Keyboard shortcuts** — press `?` or `Cmd+/` to see all shortcuts

## Quick Start

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/PetrStichauer/cleardeck.git
cd cleardeck
npm install
```

### 2. Set up Supabase

Follow [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) to:

1. Create a Supabase project
2. Run `supabase/migrations/001_cleardeck_schema.sql`
3. Enable Email auth
4. Copy env vars to `.env.local`

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account at `/signup`, and start capturing tasks.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy — then run the Supabase migration if you haven't already

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/PetrStichauer/cleardeck&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20credentials&project-name=cleardeck)

## Development

```bash
npm run dev        # Start dev server
npm run lint       # ESLint
npm run typecheck  # TypeScript check
npm run build      # Production build
npm run generate-icons  # Regenerate PWA PNG icons from icon.svg
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Report security issues privately — see [SECURITY.md](SECURITY.md).

## Roadmap

These features are planned but not yet in v0.1:

- Repeat task generation
- Action groups UI (`parent_id` exists in schema)
- Horizontal Forecast calendar
- Playwright E2E tests

## License

MIT — see [LICENSE](LICENSE).

---

> ClearDeck is an independent open-source project. It is **not affiliated with, endorsed by, or associated with The Omni Group**.
