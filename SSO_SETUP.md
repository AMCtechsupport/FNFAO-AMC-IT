# Microsoft 365 SSO (reuse Constitution Entra app)

Add a **second redirect URI** in Azure Portal for FNFAO (Constitution keeps its own callback).

## Azure redirect URI (required)

Web redirect for this app:

- Production: `https://YOUR-FNFAO-URL/api/auth/callback/microsoft-entra-id`
- Local dev: `http://localhost:3000/api/auth/callback/microsoft-entra-id`

Do **not** use Constitution's `/api/auth/sso/callback` path — NextAuth uses the path above.

## Environment variables (DigitalOcean)

```env
AUTH_SECRET=long-random-string
AUTH_URL=https://YOUR-FNFAO-URL
NEXT_PUBLIC_APP_URL=https://YOUR-FNFAO-URL

# Same tenant/app as Constitution (add FNFAO redirect URI in Azure)
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=

# Organization email domain for Microsoft sign-in
LOGIN_DOMAIN=manitobachiefs.com

# Emergency admin backdoor (env password only — not for regular users)
ADMIN_EMAIL=admin@manitobachiefs.com
ADMIN_PASSWORD=your-secure-backdoor-password
```

## Who can sign in

1. User must have an **Advocates** record with matching email (created by admin on Profile).
2. Email must end with `@manitobachiefs.com` (or `LOGIN_DOMAIN`).
3. User signs in with **Sign in with AMC email** (Microsoft).
4. **Emergency admin**: hidden form on login page uses `ADMIN_EMAIL` + `ADMIN_PASSWORD` only.

No AD security group is required.

## Auto-fill name when creating a user

When an admin enters a work email on **Create New User**, the app looks up the person in **Microsoft 365** and fills in first and last name automatically.

In Azure Portal → your app registration → **API permissions**, add this **Application** permission and grant admin consent:

- **Microsoft Graph** → `User.Read.All`

The app uses the same `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, and `AZURE_CLIENT_SECRET` as SSO. If Graph lookup is unavailable, the app may suggest a name from the email address (for example `first.last@manitobachiefs.com`) or ask the admin to enter the name manually.
