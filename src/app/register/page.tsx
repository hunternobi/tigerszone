"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { registerAction } from "./actions";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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

      router.push("/");
      router.refresh();
    });
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Registrieren</h1>
      <p className="mt-2 text-white/70">Werde Teil der TigersZone-Community und tippe mit.</p>

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

      <p className="mt-4 text-center text-sm text-white/60">
        Schon registriert?{" "}
        <Link href="/login" className="text-tigers-secondary hover:underline">
          Jetzt einloggen
        </Link>
      </p>
    </section>
  );
}
