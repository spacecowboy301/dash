# Cost Safety

## Guarantee for downloads and clones

Downloading or cloning this repository does not give another person access to
the owner's OpenAI account, database, hosting account, or billing relationship.
The repository contains no live credentials and no shared deployed backend.

Dash runs deterministically by default. Paid OpenAI evaluation requires both:

1. `ENABLE_OPENAI_EVALUATION=true`; and
2. an `OPENAI_API_KEY` supplied outside Git by the person running the app.

Therefore, a downloader can only create OpenAI charges on the account that
owns the key they personally configure. An API key that merely happens to be
present in the environment is not enough to turn paid evaluation on.

## Defense in depth

- `.env`, `.env.local`, and environment-specific local files are ignored.
- `pnpm cost:audit` rejects tracked env files, private keys, and common live
  token formats.
- `pnpm test` runs the cost audit before the test suite.
- The application reserves estimated cost before a model call and stops below
  its configured monthly ceiling.
- The OpenAI request uses `store: false`.
- No GitHub Actions workflow or public deployment runs this application.

## Owner checklist

The repository can enforce its own behavior, but it cannot configure provider
billing controls. Before opting into model calls, create a dedicated OpenAI
project, use a project-scoped key, set the lowest practical provider budget and
alerts, and revoke the key if it is ever exposed. Application-side limits are
defense in depth, not a substitute for provider controls.

For an absolute zero-API-cost setup, leave `ENABLE_OPENAI_EVALUATION=false`
and `OPENAI_API_KEY` blank.
