# Contributing to ClearDeck

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env.local` and configure Supabase (see [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md))
5. Make your changes

## Before Submitting a PR

Run all checks locally:

```bash
npm run lint && npm run typecheck && npm run build
```

Ensure your changes:

- Follow existing code style and conventions
- Do not introduce third-party product branding or personal paths
- Include updates to docs if you change setup or architecture

## Pull Request Process

1. Fill out the PR template
2. Link any related issues
3. Wait for CI to pass
4. A maintainer will review and merge

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for data model, store patterns, and Supabase integration details.

## Code of Conduct

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
