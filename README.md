# Prompt Chains

Tool for building and testing the prompt chains behind
[Caption This](https://github.com/nathangendler/hello-world-nextjs). Same Supabase project as
the app and its admin area; separate Next.js app and Vercel deployment.

## What it does

- **Chains:** create, edit, and delete prompt chains, with a mix weight that sets how often
  the app uses each one.
- **Steps:** create, edit, and delete a chain's steps. Each step has a model, a temperature,
  prompts, and a switch for whether it sees the photo. A step reads the previous step's output
  through `${previousOutput}`.
- **Reorder:** move a step up, down, or straight to a position ("move step 2 to step 1").
  The whole new order is applied in one database transaction.
- **Generate:** run a chain on a photo and see what every step produced, the prompt each one
  was sent, how long it took, and the final captions.
- **Media:** everything a chain has generated, test runs from this tool and real moments from
  the app alike.
- **Theme:** light, dark, or follow the system, remembered per browser.

## Access

Every route except the login and "not authorized" pages needs a Google sign-in **and**
`profiles.is_superadmin = true`. The proxy checks it, every page and action checks it again,
and row-level security in Postgres only lets a superadmin session change chains and steps.

## How generation works

This tool does not hold AI provider keys. It asks the main app to run the chain
(`POST /api/chains/run`), sending the signed-in admin's Supabase token. The main app verifies
the token, checks the caller is a superadmin, runs the steps with its own keys, and saves the
result as a test generation. So the pipeline and the keys live in exactly one place.

## Setup

Copy `.env.example` to `.env.local` and fill in the Supabase URL and anon key (same as the
main app) and the main app's URL. The schema lives in the main repo (`supabase-pipeline.sql`,
`supabase-chain-tool.sql`).

```bash
npm run dev
npm test
npm run typecheck
npm run lint
```
