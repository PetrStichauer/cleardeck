# Supabase Setup for ClearDeck

This guide walks through bootstrapping a fresh Supabase project for ClearDeck.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose an organization, name, database password, and region
4. Wait for the project to finish provisioning

## 2. Run the Database Migration

Open the **SQL Editor** in your Supabase dashboard and run the contents of:

```
supabase/migrations/001_cleardeck_schema.sql
```

This creates all tables, indexes, RLS policies, and triggers. It is safe to run on a fresh project.

Alternatively, with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## 3. Enable Email Authentication

1. Go to **Authentication → Providers**
2. Ensure **Email** is enabled
3. For local development, you may disable **Confirm email** under Email settings so signups work immediately without email verification

For production, keep email confirmation enabled and configure SMTP.

## 4. Set Environment Variables

Copy the project URL and anon key from **Settings → API**:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 5. Create Your First User

1. Start the app: `npm run dev`
2. Open [http://localhost:3000/signup](http://localhost:3000/signup)
3. Create an account with email and password (minimum 6 characters)
4. You will be redirected to Inbox — create a task to verify persistence

## 6. Verify Row Level Security

To confirm multi-user isolation:

1. Create a second account in an incognito window
2. Add tasks in each account
3. Confirm neither user can see the other's data

## Local Supabase (Optional)

For fully local development:

```bash
supabase start
```

Use the local URL and anon key printed by the CLI. The included `supabase/config.toml` has signup enabled with email confirmations disabled for convenience.

## Troubleshooting

| Issue | Fix |
|---|---|
| `permission denied for table tasks` | Re-run migration; ensure RLS policies exist |
| Signup succeeds but no redirect | Check browser console; verify env vars are set |
| Tasks don't persist | Confirm you're logged in; check Supabase logs for RLS errors |
| `Invalid API key` | Double-check `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` |
