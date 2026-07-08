# Swagger Editor App

A small OpenAPI workspace built with Next.js and TypeScript.

The app lets you paste an OpenAPI schema, validate it, browse generated endpoints, prepare API requests, generate cURL commands, send requests through a server proxy, and view request history when signed in.

Live demo:

```text
https://swagger-editor-app-eight.vercel.app/
```

## What is inside

- OpenAPI editor with JSON/YAML support
- Schema validation and formatted validation errors
- Swagger viewer with generated endpoints
- Request console with params, headers, body, cURL generation, copy action, and proxy execution
- Supabase auth with sign in, sign up, and sign out
- Saved schema for authenticated users
- Request history and basic analytics
- English and Russian UI
- Unit tests and coverage config

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Supabase
- next-intl
- Vitest
- Tailwind CSS

## Requirements

Use Node.js 24.x.

For local development with `nvm`, run:

```bash
nvm install
nvm use
```

The team uses:

```bash
node -v # v24.17.0
npm -v  # 11.13.0
```

The repository uses `engine-strict=true`, so npm will complain if the Node major version is different.

## Environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Then fill in your own Supabase values in `.env.local`.

## Installation

Install dependencies from the lockfile:

```bash
npm ci
```

Use `npm ci` for normal setup. Use `npm install` only when you intentionally change dependencies.

## Development

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Manual testing with DummyJSON Lite

For a quick review, the editor opens with a small DummyJSON schema by default.

The same schema is also stored here:

```text
examples/openapi/dummyjson-lite.yaml
```

Suggested flow:

1. Open the app.
2. Click **Validate**.
3. Check that the viewer shows three endpoints:
   - `GET /products`
   - `POST /products/add`
   - `GET /products/{id}`
4. Select `GET /products/{id}` and fill the `id` path parameter.
5. Click **Generate cURL** and copy the generated command.
6. Select `POST /products/add`, generate cURL, and check that it includes `Content-Type: application/json`.
7. If you are signed in, execute a request and check that it appears in History.

## Supabase

Migrations are stored in:

```text
supabase/migrations
```

If your Supabase project is already linked, apply migrations with:

```bash
npx supabase migration up --linked
```

If the project is not linked yet:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase migration up --linked
```

## Checks

Run the full local check before opening a PR:

```bash
npm run check
```

This runs formatting check, ESLint, TypeScript, and tests.

Useful separate commands:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:coverage
```

Tests also run automatically before `git push` through Husky.

## Project notes

- Routes are not locale-prefixed. The language is selected in the UI and stored in a cookie.
- Auth pages live outside the main app shell.
- The main editor workspace state is kept while navigating between main routes during one client session.
- Request history and saved schemas require an authenticated Supabase user.
- The proxy route runs on the server and blocks unsafe target URLs before making requests.

## Deploy

The app is ready for Vercel deployment.

Make sure the same environment variables are added in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

The Node runtime is controlled by `package.json` and `.nvmrc`.
