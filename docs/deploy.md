# Deploy _alice to Railway + alice.shiosos.dev

## Railway (app + Postgres)

1. Create a Railway project named `_alice` (or similar).
2. Add a **Postgres** plugin/service; copy `DATABASE_URL` into the web service.
3. Add a **Web** service from this GitHub repo (Nixpacks / Node).
4. Set start command if needed: `node .output/server/index.mjs` (see `railway.toml`).
5. Configure env vars from `.env.example` (map `NUXT_*` as listed).
6. Set `NUXT_PUBLIC_APP_URL=https://alice.shiosos.dev`.
7. Enable Postgres backups in the Railway dashboard (Point-in-Time / automatic backups).

Build: Railway should run `npm ci` / `npm run build` via Nixpacks. Override build command to `npm run build` if prompted.

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

## CI

GitHub Actions runs lint + typecheck on PRs. Deploy to Railway from `main` via Railway’s GitHub integration (connect the repo in Railway) or the workflow deploy job once `RAILWAY_TOKEN` is set.
