# AMC-FNFAO Database

<div align="center">
  <img src="public/logo.png" alt="Logo" width="400" height="400">
</div>

***Abinoojiyak Bigiiwewag — Our Children are Coming Home.***

## About The Application

The AMC-FNFAO Database is a system to track information about clients who are served at the First Nations Family Advocate Office.

### Built With

* [Next.js](https://nextjs.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [PostgreSQL](https://www.postgresql.org/) on DigitalOcean
* [Auth.js](https://authjs.dev/) for authentication

## Environment Variables

Create `.env.local` for local development:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
AUTH_SECRET=generate-a-long-random-string
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional seed overrides
ADMIN_EMAIL=admin@fnfao.local
ADMIN_PASSWORD=changeme123

# Optional email (SMTP — same vars as AMC constitution app)
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
SMTP_PORT=587
EMAIL_FROM=
EMAIL_FROM_NAME=AMC FNFAO

# Optional file storage — local disk when Spaces is not set
ATTACHMENTS_DIR=./storage/attachments

# DigitalOcean Spaces — dedicated FNFAO bucket (recommended for production)
# Create a NEW Space in the DO control panel; do not reuse the constitution app bucket.
# SPACES_ENDPOINT=https://tor1.digitaloceanspaces.com
#   (or the Origin Endpoint DO shows, e.g. https://fnfaobucket.tor1.digitaloceanspaces.com)
# SPACES_BUCKET=fnfaobucket
# SPACES_REGION=tor1
# SPACES_ACCESS_KEY_ID=
# SPACES_SECRET_ACCESS_KEY=
# SPACES_ATTACHMENTS_PREFIX=attachments
```

Generate `AUTH_SECRET`:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

1. Create a DigitalOcean Managed PostgreSQL database
2. Link it to your App Platform app (sets `DATABASE_URL`)
3. Run the seed script once:

```sh
npm run db:seed
```

This creates all tables and a default admin user.

## Local Development

```sh
npm install
npm run db:seed
npm run dev
```

Sign in at `/login` with the admin credentials from your env vars.

## DigitalOcean Deployment

1. Create an App Platform app from this repo
2. Add a Managed PostgreSQL database and **link it to the app** (injects `DATABASE_URL`)
3. Set environment variables in **App → Settings → Environment Variables**:

| Variable | Required | Build + Run | Notes |
|----------|----------|-------------|-------|
| `DATABASE_URL` | Yes | Run | Auto-set when database is linked |
| `AUTH_SECRET` | Yes | **Both** | Random string; generate with command below |
| `NEXT_PUBLIC_APP_URL` | Yes | **Both** | e.g. `https://your-app.ondigitalocean.app` |
| `ADMIN_EMAIL` | Recommended | Run | Login email for first admin (default: `admin@fnfao.local`) |
| `ADMIN_PASSWORD` | Recommended | Run | Login password for first admin (default: `changeme123`) |
| `SMTP_HOST` | For emails | Run | Same SMTP server as your other AMC apps |
| `SMTP_PORT` | For emails | Run | Usually `587` |
| `SMTP_SECURE` | No | Run | `true` for port 465, otherwise `false` |
| `SMTP_USER` | For emails | Run | SMTP username |
| `SMTP_PASS` | For emails | Run | SMTP password |
| `EMAIL_FROM` | No | Run | From address (defaults to `SMTP_USER`) |
| `EMAIL_FROM_NAME` | No | Run | Display name (default: `AMC FNFAO`) |
| `SPACES_ENDPOINT` | For file storage | Run | Regional endpoint only, e.g. `https://tor1.digitaloceanspaces.com` |
| `SPACES_BUCKET` | For file storage | Run | **Dedicated** FNFAO Space name (e.g. `amc-fnfao-attachments`) |
| `SPACES_ACCESS_KEY_ID` | For file storage | Run | Access key for this Space (create new keys in DO → API → Spaces Keys) |
| `SPACES_SECRET_ACCESS_KEY` | For file storage | Run | Secret for that key |
| `SPACES_REGION` | No | Run | Region slug (e.g. `tor1`); inferred from endpoint if omitted |
| `SPACES_ATTACHMENTS_PREFIX` | No | Run | Folder inside bucket (default: `attachments`) |

Without `SPACES_*` vars, note attachments are stored on the app container disk and are **lost on redeploy**. Use a dedicated Space in production.

### Create a dedicated FNFAO Space

1. In [DigitalOcean](https://cloud.digitalocean.com/spaces), click **Create Space**.
2. Pick the **same region** as your FNFAO app database if possible (e.g. Toronto → `tor1`).
3. Name it something unique, e.g. **`amc-fnfao-attachments`** (names are global across DO).
4. **Create new Spaces access keys** (API → Spaces access keys → Generate New Key). Use these only on the FNFAO app — not the constitution app keys.
5. On the FNFAO App Platform app, set the `SPACES_*` variables above (**Run** scope). Use the regional endpoint, not the bucket URL.
6. Redeploy. Logs should show: `DigitalOcean Spaces ready (bucket: amc-fnfao-attachments, prefix: attachments).`

Files are stored as `attachments/client_{id}/{uuid}-{filename}` inside your new bucket. The constitution app is unaffected.

4. Deploy the app. The **start command** runs `scripts/seed.mjs` automatically before the server starts (creates tables + first admin if missing).
5. Verify: open `https://your-app.ondigitalocean.app/api/health`
6. Sign in at `/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`

You do **not** need Supabase or Clerk.

## Usage

```sh
npm run dev      # development
npm run build    # production build
npm start        # run production build
```
