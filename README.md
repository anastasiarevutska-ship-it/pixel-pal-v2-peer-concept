# Pixel Pal — Prototype

Clickable prototype scaffold. See [docs/pixel-pal-prototype-spec.md](docs/pixel-pal-prototype-spec.md) for the full build spec.

## Stack

Vite + React 18 + TypeScript + Tailwind CSS + Zustand (persist) + React Router + Framer Motion.

## Status

**Phase 1 (Member journey) and Phase 2 (Pal journey) are both built and working end to end** —
spec §7 M1–M9, and the workshop doc §6.5 P1–P11. Phase 3 (Coordinator) is a placeholder only.

See [docs/current-state.md](docs/current-state.md) for the full route map, what's verified, design-token
corrections found while building against real Figma screens, and what's still out of scope.

## Run

```bash
npm install
npm run dev
```

Then open `/` and click **Member** to walk the receiving side (`/m`), or **Pal** for the giving
side (`/pal`). Both share the same tokens, primitives, Home, and Contacts screens.

## Live prototype

Deployed via Netlify, auto-deploying on every push to the `pal-journey` branch (the single
working branch — see `docs/current-state.md` for what's built). `main` is not kept in sync and
should be treated as stale.

https://dashing-sunshine-27850c.netlify.app

(Currently behind Netlify's Team protection — viewers need to be signed into the Netlify team to
load it. Disable in Netlify's Site configuration → Visitor access if it should be publicly shareable.)
