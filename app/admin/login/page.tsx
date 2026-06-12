"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { setAdminToken } from "@/lib/admin-auth";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const client = createBrowserSupabaseClient();
    if (!client) {
      setError("Supabase is not configured.");
      setIsSubmitting(false);
      return;
    }

    const { data, error: signInError } = await client.auth.signInWithPassword({ email, password });

    if (signInError || !data.session) {
      setError(signInError?.message ?? "Unable to sign in");
      setIsSubmitting(false);
      return;
    }

    setAdminToken(data.session.access_token);
    document.cookie = `admin_access_token=${data.session.access_token}; Path=/; Max-Age=604800; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    router.push("/admin/recipes");
  };

  return (
    <main className="max-w-[800px] mx-auto min-h-screen bg-surface">
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 h-16 bg-surface/90 backdrop-blur-md">
        <Link className="inline-flex items-center justify-center w-10 h-10 rounded-full text-onSurfaceVariant hover:text-onSurface hover:bg-surfaceContainerHigh transition-colors" href="/" aria-label="Back to Home">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-onSurface m-0">Admin Login</h1>
      </header>
      <section className="px-4 py-8 max-w-sm mx-auto">
        <div className="bg-surfaceContainerLowest p-6 rounded-2xl shadow-sm border border-outlineVariant/30 flex flex-col gap-6">
          <p className="text-onSurfaceVariant font-medium text-center m-0">Sign in with your admin account.</p>
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="admin-email" className="admin-label">Email</label>
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
                className="admin-input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="admin-password" className="admin-label">Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="admin-input w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-onSurfaceVariant hover:text-onSurface transition-colors p-1 rounded-full"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-onPrimary font-bold rounded-full min-h-[56px] text-lg px-4 flex items-center justify-center transition-transform active:scale-95 shadow-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
          {error && (
            <p className="text-error text-sm font-bold text-center m-0" aria-live="polite" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
