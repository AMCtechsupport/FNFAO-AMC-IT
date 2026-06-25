"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const errorParam = searchParams.get("error");

  const [ssoConfigured, setSsoConfigured] = useState(false);
  const [loginDomain, setLoginDomain] = useState("manitobachiefs.com");
  const [showBackdoor, setShowBackdoor] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [errorParam]);

  useEffect(() => {
    fetch("/api/auth/sso-status")
      .then((res) => res.json())
      .then((data) => {
        setSsoConfigured(Boolean(data.ssoConfigured));
        if (data.loginDomain) setLoginDomain(data.loginDomain);
      })
      .catch(() => setSsoConfigured(false));
  }, []);

  const redirectAfterLogin = async () => {
    const session = await getSession();
    const role = session?.user?.role;
    const dest = callbackUrl ?? (role === "admin" ? "/admin" : "/user-dashboard");
    router.push(dest);
    router.refresh();
  };

  const handleMicrosoftSignIn = async () => {
    setLoading(true);
    setError("");
    await signIn("microsoft-entra-id", {
      callbackUrl: callbackUrl ?? "/role-redirect",
    });
  };

  const handleBackdoorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid emergency admin credentials.");
      return;
    }

    await redirectAfterLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-md w-full max-w-3xl overflow-hidden">
        <div className="px-8 pt-8 pb-4 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h1>
          <p className="text-sm text-gray-500">AMC-FNFAO Database</p>
        </div>

        {error && (
          <div className="mx-8 mt-6 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="p-8 md:border-r border-gray-100">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Microsoft 365
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Sign in with your <strong>@{loginDomain}</strong> work account.
              Your administrator must add you to FNFAO before you can sign in.
            </p>
            <button
              type="button"
              onClick={handleMicrosoftSignIn}
              disabled={loading || !ssoConfigured}
              className="w-full rounded-md bg-[#7504ff] px-4 py-3 text-white font-semibold hover:bg-[#6700ea] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23" aria-hidden="true">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              {loading ? "Redirecting…" : "Sign in with AMC email"}
            </button>
            {!ssoConfigured && (
              <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                Microsoft sign-in is not configured on this server yet. Set AZURE_TENANT_ID,
                AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET in the environment.
              </p>
            )}
          </div>

          <div className="p-8 bg-gray-50">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Emergency access
            </h2>
            {!showBackdoor ? (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  For administrators only, if Microsoft sign-in is unavailable.
                </p>
                <button
                  type="button"
                  onClick={() => setShowBackdoor(true)}
                  className="text-sm font-medium text-gray-700 underline hover:text-gray-900"
                >
                  Use emergency admin sign-in
                </button>
              </div>
            ) : (
              <form onSubmit={handleBackdoorSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:opacity-60"
                >
                  {loading ? "Signing in…" : "Emergency sign in"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100" />}>
      <LoginForm />
    </Suspense>
  );
}
