import "server-only";
import { isAzureSsoConfigured } from "./sso-config";

const GRAPH_SCOPE = "https://graph.microsoft.com/.default";
const USER_SELECT =
  "givenName,surname,displayName,mail,userPrincipalName,otherMails,proxyAddresses";

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

function namesFromGraphUser(user) {
  if (!user) return null;

  let firstName = String(user.givenName || "").trim();
  let lastName = String(user.surname || "").trim();

  if (!firstName && !lastName && user.displayName) {
    const parts = String(user.displayName).trim().split(/\s+/);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  if (!firstName && !lastName) return null;

  return {
    firstName,
    lastName: lastName || firstName,
  };
}

function graphErrorMessage(status, graphError) {
  const code = graphError?.code || "";
  const message = graphError?.message || "";

  if (status === 403 || code === "Authorization_RequestDenied") {
    return {
      error:
        "Microsoft 365 directory lookup is not permitted yet. An Azure admin must add Microsoft Graph application permission User.Read.All and grant admin consent on the FNFAO app registration.",
      permissionDenied: true,
    };
  }

  if (status === 401) {
    return {
      error: "Could not authenticate with Microsoft Graph. Check AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET.",
    };
  }

  console.error("[azure-directory] Graph error:", status, code, message);
  return {
    error:
      "Could not look up this user in Microsoft 365. Check the email or enter the name manually.",
    graphStatus: status,
    graphCode: code || undefined,
  };
}

async function fetchGraphJson(token, url, extraHeaders = {}) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...extraHeaders,
    },
    cache: "no-store",
  });

  const json = await response.json().catch(() => ({}));
  return { response, json };
}

async function lookupUserDirect(token, email) {
  const url =
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(email)}` +
    `?$select=${USER_SELECT}`;

  const { response, json } = await fetchGraphJson(token, url);
  if (response.status === 404) {
    return { user: null };
  }
  if (!response.ok) {
    return { error: graphErrorMessage(response.status, json.error) };
  }

  return { user: json };
}

async function lookupUserByFilter(token, email) {
  const escaped = email.replace(/'/g, "''");
  const filter = encodeURIComponent(
    `mail eq '${escaped}' or userPrincipalName eq '${escaped}'`,
  );
  const url =
    `https://graph.microsoft.com/v1.0/users?$filter=${filter}` +
    `&$select=${USER_SELECT}&$count=true&$top=1`;

  const { response, json } = await fetchGraphJson(token, url, {
    ConsistencyLevel: "eventual",
  });

  if (!response.ok) {
    return { error: graphErrorMessage(response.status, json.error) };
  }

  const user = Array.isArray(json.value) ? json.value[0] : null;
  return { user: user || null };
}

function fallbackResult(normalized, graphMeta = {}) {
  const guessed = guessNamesFromEmail(normalized);
  if (guessed) {
    return {
      found: true,
      configured: true,
      ...graphMeta,
      ...guessed,
    };
  }

  return {
    found: false,
    configured: true,
    ...graphMeta,
    error: graphMeta.error ||
      "No Microsoft 365 user found for this email address. Enter the name manually.",
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

  const direct = await lookupUserDirect(token, normalized);
  if (direct.error?.permissionDenied) {
    return { found: false, configured: true, ...direct.error };
  }

  let user = direct.user;
  let graphMeta = {};

  if (!user && !direct.error) {
    const filtered = await lookupUserByFilter(token, normalized);
    if (filtered.error?.permissionDenied) {
      return { found: false, configured: true, ...filtered.error };
    }
    if (filtered.error) {
      graphMeta = {
        graphError: true,
        ...filtered.error,
      };
    } else {
      user = filtered.user;
    }
  } else if (direct.error) {
    graphMeta = {
      graphError: true,
      ...direct.error,
    };
  }

  if (!user) {
    if (graphMeta.permissionDenied) {
      return { found: false, configured: true, ...graphMeta };
    }
    return fallbackResult(normalized, {
      ...graphMeta,
      notInDirectory: !graphMeta.graphError,
    });
  }

  const names = namesFromGraphUser(user);
  if (!names) {
    return fallbackResult(normalized, {
      incompleteProfile: true,
    });
  }

  return {
    found: true,
    configured: true,
    source: "graph",
    ...names,
  };
}
