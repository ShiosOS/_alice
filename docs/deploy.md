# Deploy _alice to Railway + alice.shiosos.dev

## Railway (app + Postgres)

1. Create a Railway project named `_alice` (or similar).
2. Add a **Postgres** plugin/service; copy `DATABASE_URL` into the web service.
3. Add a **Web** service from this GitHub repo (Nixpacks / Node).
4. Set start command if needed: `node .output/server/index.mjs` (see `railway.toml`).
5. Configure env vars from `.env.example` (map `NUXT_*` as listed).
6. Set `NUXT_PUBLIC_APP_URL=https://alice.shiosos.dev`.
7. Enable Postgres backups in the Railway dashboard (Point-in-Time / automatic backups).
8. Run migrations against `DATABASE_URL`: `npm run db:push` (dev) or apply `server/db/migrations/0000_init.sql`.

### Backups restore check

After enabling Railway Postgres backups, once verify you can see restore points in the Railway UI (or run a restore into a throwaway DB). Note the steps you used in your personal ops notes — do not skip this once the project exists.


## Custom domain (Cloudflare → Railway)

Zone: `shiosos.dev` (already on Cloudflare).

1. In Railway → Web service → Settings → Networking → Custom Domain → add `alice.shiosos.dev`.
2. Railway shows the required DNS target (usually a CNAME).
3. In Cloudflare DNS for `shiosos.dev`, create:
   - Type: `CNAME`
   - Name: `alice`
   - Target: the Railway hostname
   - Proxy: DNS only (grey cloud) until Railway TLS is happy; then optional orange-cloud.
4. Wait for Railway to issue HTTPS for `alice.shiosos.dev`.
5. Confirm `NUXT_PUBLIC_APP_URL=https://alice.shiosos.dev`.
6. Add OAuth callback URLs for Google (when auth lands):
   - `https://alice.shiosos.dev/...` (provider-specific)
   - `http://localhost:3000/...` for local dev

## Quotas and billing caps

Before inviting others:

1. **YouTube Data API:** set a budget/quota alert in Google Cloud; keep daily expand budgets low (`NUXT_EXPAND_DAILY_BUDGET`).
2. **AI provider:** set a hard monthly spend cap in the vendor dashboard; keep `NUXT_EXPAND_DISABLED=true` as an emergency switch.
3. Confirm Railway spend alerts if available.

