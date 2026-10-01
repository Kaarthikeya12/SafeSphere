# SafeSphere

**Safety, within reach.** A personal-safety and community-resilience web app built for the Sankalp Setu Student AI Hackathon (theme: Safety, Disaster Management & Community Resilience).

SOS with 112 and a shareable location message · live location · trusted contacts · timed check-ins · incident reports with AI-assisted categorisation · opt-in anonymised community feed · nearby help (OpenStreetMap) · offline emergency guidance.

> SafeSphere is a student prototype, **not an emergency service**. It never contacts anyone automatically. In India, call **112**.

## Quick start

Requires Node.js 22.13+ (uses the built-in `node:sqlite`).

```bash
npm install
cp .env.example .env.local   # set BETTER_AUTH_SECRET; Google + Anthropic keys are optional
npm run dev                  # http://localhost:3000
```

| Command | Purpose |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | Route types + `tsc` |
| `npm test` | Unit tests (Node test runner) |
| `npm run build && npm start` | Production build / server |
| `BASE_URL=… npm run test:api` | API integration tests against a running server |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Better Auth (email/password + Google OAuth) · SQLite (`node:sqlite`) · Leaflet + OpenStreetMap · Anthropic Claude (optional, server-side) with a labelled rule-based fallback.

See **[docs/IMPLEMENTATION_REPORT.md](docs/IMPLEMENTATION_REPORT.md)** for architecture, AI disclosure, Google OAuth setup, environment variables, test results, limitations and the demo script.
