# Security Policy

## Reporting a Vulnerability

If you discover a security issue — especially around authentication, session
handling, or Supabase Row Level Security — please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, use [GitHub Private Vulnerability Reporting](https://github.com/PetrStichauer/cleardeck/security/advisories/new)
or open a security advisory from the repository **Security** tab.

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We aim to acknowledge reports within 48 hours and provide a fix timeline
within 7 days for confirmed issues.

## Scope

In scope:

- Authentication and authorization bypass
- RLS policy gaps allowing cross-user data access
- XSS or injection in user-generated content fields
- Session fixation or token leakage

Out of scope:

- Denial of service against self-hosted instances
- Issues requiring physical access to a user's device
- Social engineering

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |
