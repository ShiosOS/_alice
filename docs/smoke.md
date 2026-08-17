# End-to-end smoke checklist

## PR CI vs promote gate

| Gate | What runs | Live YouTube / AI? |
| --- | --- | --- |
| **PR CI** | `lint` + `typecheck` + unit (`test:coverage`) + Nuxt integration (`test:nuxt`) + thin e2e (`test:e2e`) | No — dummy keys / mocked or unused providers |
| **Promote gate** | Staging checklist below + `scripts/e2e-smoke.mjs` against staging | Yes — real providers on staging |

PR CI covers auth rejection, terms gate on create, public privacy/terms/about HTML, and `/health`. Full create → expand → watch with real provider spend stays **promote-only** via `e2e-smoke.mjs` (do not wire it into PR CI).

Create/expand/watch **integration** with fixture providers needs service-level YouTube/AI mocks inside the Nuxt server process; until those land, rely on unit tests + promote smoke for that path.

---

Run on **staging** after a merge to `main` (and locally when developing). Promote to production only after this passes. See `docs/deploy.md`.

Hosts:

- staging (default): `https://alice-staging.shiosos.dev`
- production (after promote): `https://alice.shiosos.dev`

1. Open **staging** (or localhost).
2. Sign in with Google; accept Terms.
3. **Start a new Rabbit Hole** with a known YouTube URL.
4. Confirm ~10-node first graph with short phrases on forks.
5. Focus a node → **Expand** → new forks appear.
6. **Watch on YouTube** → Path highlight updates; YouTube opens.
7. Return to Rabbit Holes list; reopen the same hole on a second browser/device.
8. Confirm Privacy/Terms/About load while signed out.
9. Confirm `GET /health` returns 200.

Optional failures to poke: invalid URL, expand with `NUXT_EXPAND_DISABLED=true`, budget exhaustion.

Then promote: `git push origin origin/main:production`.

Ops note: schema is created by `scripts/db-migrate.mjs` on each Railway deploy (`railway.toml` preDeployCommand). If OAuth returns 500 with `relation "users" does not exist`, migrations did not run.

### Automated API smoke (promote gate)

With **staging** `DATABASE_URL` (TCP proxy) and staging `NUXT_SESSION_PASSWORD`:

```bash
DATABASE_URL=... NUXT_SESSION_PASSWORD=... node scripts/e2e-smoke.mjs
# defaults to https://alice-staging.shiosos.dev
```

This seals a session cookie, creates a Rabbit Hole from a YouTube URL, expands, watches, and reopens the hole — covering checklist steps 3–7 without a browser. Do not point it at production unless you intend to write smoke users there.
