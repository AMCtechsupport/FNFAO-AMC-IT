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

# Optional email
RESEND_API_KEY=
RESEND_FROM_EMAIL=no-reply@example.com

# Optional file storage path (defaults to ./storage/attachments)
ATTACHMENTS_DIR=./storage/attachments
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
| `RESEND_API_KEY` | No | Run | Welcome emails only |
| `RESEND_FROM_EMAIL` | No | Run | From address for emails |

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
