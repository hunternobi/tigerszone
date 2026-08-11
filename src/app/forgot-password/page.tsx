"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { forgotPasswordAction } from "./actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await forgotPasswordAction(email);
      if (!result.success) {
        setError(result.error ?? "Anfrage fehlgeschlagen.");
        return;
      }
      setSent(true);
    });
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Passwort vergessen</h1>
      <p className="mt-2 text-white">
        Gib deine E-Mail-Adresse ein, wir schicken dir einen Link zum Zurücksetzen.
      </p>

      {sent ? (
        <div className="glass-panel mt-8 p-6">
          <p className="text-white">
            Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir einen Link zum
            Zurücksetzen deines Passworts geschickt.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel mt-8 flex flex-col gap-4 p-6">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-white">
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

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 rounded-full bg-tigers-secondary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Wird gesendet…" : "Link anfordern"}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-white">
        <Link href="/login" className="text-tigers-secondary hover:underline">
          Zurück zum Login
        </Link>
      </p>
    </section>
  );
}
