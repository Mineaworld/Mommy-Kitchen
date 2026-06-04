"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const client = createBrowserSupabaseClient();
    if (!client) {
      setError("Supabase is not configured.");
      return;
    }

    const { data, error: signInError } = await client.auth.signInWithPassword({ email, password });

    if (signInError || !data.session) {
      setError(signInError?.message ?? "Unable to sign in");
      return;
    }

    localStorage.setItem("admin_access_token", data.session.access_token);
    document.cookie = `admin_access_token=${data.session.access_token}; Path=/; Max-Age=604800; SameSite=Lax`;
    router.push("/admin/recipes");
  };

  return (
    <main className="max-w-[800px] mx-auto min-h-screen bg-surface">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 h-16 bg-surface/90 backdrop-blur-md">
        <h1 className="text-xl font-bold text-onSurface m-0">Admin Login</h1>
        <Link className="inline-flex items-center justify-center h-10 px-4 rounded-full text-sm font-semibold text-primary bg-surfaceContainer hover:bg-surfaceContainerHigh transition-colors" href="/">
          Home
        </Link>
      </header>
      <section className="px-4 py-8 max-w-sm mx-auto">
        <div className="bg-surfaceContainerLowest p-6 rounded-2xl shadow-sm border border-outlineVariant/30 flex flex-col gap-6">
          <p className="text-onSurfaceVariant font-medium text-center m-0">Sign in with your admin account.</p>
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="admin-email" className="font-bold text-onSurface text-base">Email</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full bg-surfaceContainer border-b-2 border-outline focus:border-primary rounded-t-lg p-3 text-base text-onSurface outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="admin-password" className="font-bold text-onSurface text-base">Password</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full bg-surfaceContainer border-b-2 border-outline focus:border-primary rounded-t-lg p-3 text-base text-onSurface outline-none transition-colors"
              />
            </div>
            <button type="submit" className="w-full bg-primary text-onPrimary font-bold rounded-full min-h-[56px] text-lg px-4 flex items-center justify-center transition-transform active:scale-95 shadow-sm mt-2">
              Sign in
            </button>
          </form>
          {error && (
            <p className="text-error text-sm font-bold text-center m-0" aria-live="polite">
              {error}
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
