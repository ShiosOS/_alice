# End-to-end smoke checklist

Run after Railway + `alice.shiosos.dev` + Google OAuth + YouTube/AI keys are configured.

Hosts:

- production: `https://alice.shiosos.dev`
- staging: `https://alice-staging.shiosos.dev`
- feature: `https://alice-feature.shiosos.dev`

1. Open production (or localhost).
2. Sign in with Google; accept Terms.
3. **Start a new Rabbit Hole** with a known YouTube URL.
4. Confirm ~10-node first graph with short phrases on forks.
5. Focus a node → **Expand** → new forks appear.
6. **Watch on YouTube** → Path highlight updates; YouTube opens.
7. Return to Rabbit Holes list; reopen the same hole on a second browser/device.
8. Confirm Privacy/Terms/About load while signed out.

Optional failures to poke: invalid URL, expand with `NUXT_EXPAND_DISABLED=true`, budget exhaustion.

Ops note: schema is created by `scripts/db-migrate.mjs` on each Railway deploy (`railway.toml` preDeployCommand). If OAuth returns 500 with `relation "users" does not exist`, migrations did not run.

### Automated API smoke

With prod `DATABASE_URL` (TCP proxy) and `NUXT_SESSION_PASSWORD`:

```bash
DATABASE_URL=... NUXT_SESSION_PASSWORD=... node scripts/e2e-smoke.mjs
```

This seals a session cookie, creates a Rabbit Hole from a YouTube URL, expands, watches, and reopens the hole — covering checklist steps 3–7 without a browser.
