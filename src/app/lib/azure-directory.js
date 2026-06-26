import "server-only";
import { isAzureSsoConfigured } from "./sso-config";

const GRAPH_SCOPE = "https://graph.microsoft.com/.default";

async function getGraphAccessToken() {
  const tenantId = (process.env.AZURE_TENANT_ID || "").trim();
  const clientId = (process.env.AZURE_CLIENT_ID || "").trim();
  const clientSecret = (process.env.AZURE_CLIENT_SECRET || "").trim();

  if (!tenantId || !clientId || !clientSecret) {
    return null;
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: GRAPH_SCOPE,
    grant_type: "client_credentials",
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    },
  );

  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.access_token) {
    console.error("[azure-directory] Token request failed:", json.error || response.status);
    return null;
  }

  return json.access_token;
}

function capitalizeWord(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export function guessNamesFromEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  const local = normalized.split("@")[0] || "";
  if (!local.includes(".")) return null;

  const parts = local.split(".").filter(Boolean);
  if (parts.length < 2) return null;

  return {
    firstName: capitalizeWord(parts[0]),
    lastName: capitalizeWord(parts.slice(1).join(" ")),
    source: "email-guess",
  };
}

export async function lookupDirectoryUserByEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) {
    return { found: false, error: "Email is required." };
  }

  if (!isAzureSsoConfigured()) {
    const guessed = guessNamesFromEmail(normalized);
    if (guessed) {
      return { found: true, configured: false, ...guessed };
    }
    return {
      found: false,
      configured: false,
      error: "Microsoft directory lookup is not configured.",
    };
  }

  const token = await getGraphAccessToken();
  if (!token) {
    return {
      found: false,
      configured: true,
      error: "Could not authenticate with Microsoft Graph.",
    };
  }

  const escaped = normalized.replace(/'/g, "''");
  const filter = encodeURIComponent(
    `mail eq '${escaped}' or userPrincipalName eq '${escaped}'`,
  );
  const url =
    `https://graph.microsoft.com/v1.0/users?$filter=${filter}` +
    "&$select=givenName,surname,displayName,mail,userPrincipalName&$top=1";

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("[azure-directory] Graph lookup failed:", json.error || response.status);
    const guessed = guessNamesFromEmail(normalized);
    if (guessed) {
      return {
        found: true,
        configured: true,
        graphError: true,
        ...guessed,
      };
    }
    return {
      found: false,
      configured: true,
      error:
        "Could not look up this user in Microsoft 365. Check the email or enter the name manually.",
    };
  }

  const user = Array.isArray(json.value) ? json.value[0] : null;
  if (!user) {
    const guessed = guessNamesFromEmail(normalized);
    if (guessed) {
      return {
        found: true,
        configured: true,
        notInDirectory: true,
        ...guessed,
      };
    }
    return {
      found: false,
      configured: true,
      error: "No Microsoft 365 user found for this email address.",
    };
  }

  let firstName = String(user.givenName || "").trim();
  let lastName = String(user.surname || "").trim();

  if (!firstName && !lastName && user.displayName) {
    const parts = String(user.displayName).trim().split(/\s+/);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  if (!firstName && !lastName) {
    const guessed = guessNamesFromEmail(normalized);
    if (guessed) {
      return {
        found: true,
        configured: true,
        incompleteProfile: true,
        ...guessed,
      };
    }
    return {
      found: false,
      configured: true,
      error: "Microsoft 365 has this user but no name on file. Enter the name manually.",
    };
  }

  return {
    found: true,
    configured: true,
    source: "graph",
    firstName,
    lastName: lastName || firstName,
  };
}
