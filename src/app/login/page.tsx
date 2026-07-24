"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition, type FormEvent } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("E-Mail oder Passwort ist falsch.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel mt-8 flex flex-col gap-4 p-6">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-white/80">
          E-Mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="glass-panel-sm w-full px-4 py-2 text-white focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-white/80">
          Passwort
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="glass-panel-sm w-full px-4 py-2 text-white focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-full bg-tigers-secondary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Wird eingeloggt…" : "Einloggen"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Login</h1>
      <p className="mt-2 text-white/70">Melde dich an, um mitzutippen.</p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <Suspense fallback={null}>
        <RegisterLink />
      </Suspense>
    </section>
  );
}

function RegisterLink() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const href = callbackUrl ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/register";

  return (
    <p className="mt-4 text-center text-sm text-white/60">
      Noch kein Konto?{" "}
      <Link href={href} className="text-tigers-secondary hover:underline">
        Jetzt registrieren
      </Link>
    </p>
  );
}
