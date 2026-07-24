"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition, type FormEvent } from "react";
import { registerAction } from "./actions";

function RegisterForm() {
  const [name, setName] = useState("");
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
      const result = await registerAction(name, email, password);
      if (!result.success) {
        setError(result.error ?? "Registrierung fehlgeschlagen.");
        return;
      }

      const signInResult = await signIn("credentials", { email, password, redirect: false });
      if (signInResult?.error) {
        setError("Konto erstellt. Bitte logge dich manuell ein.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel mt-8 flex flex-col gap-4 p-6">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-white/80">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="glass-panel-sm w-full px-4 py-2 text-white focus:outline-none"
        />
      </div>
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
          minLength={8}
          className="glass-panel-sm w-full px-4 py-2 text-white focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-full bg-tigers-secondary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Wird erstellt…" : "Konto erstellen"}
      </button>
    </form>
  );
}

function LoginLink() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const href = callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login";

  return (
    <p className="mt-4 text-center text-sm text-white/60">
      Schon registriert?{" "}
      <Link href={href} className="text-tigers-secondary hover:underline">
        Jetzt einloggen
      </Link>
    </p>
  );
}

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Registrieren</h1>
      <p className="mt-2 text-white/70">Werde Teil der TigersZone-Community und tippe mit.</p>

      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>

      <Suspense fallback={null}>
        <LoginLink />
      </Suspense>
    </section>
  );
}
