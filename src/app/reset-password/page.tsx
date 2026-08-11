"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition, type FormEvent } from "react";
import { resetPasswordAction } from "./actions";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await resetPasswordAction(token, password);
      if (!result.success) {
        setError(result.error ?? "Zurücksetzen fehlgeschlagen.");
        return;
      }
      setDone(true);
    });
  }

  if (!token) {
    return (
      <div className="glass-panel mt-8 p-6">
        <p className="text-red-400">Ungültiger Link. Bitte fordere einen neuen an.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm text-tigers-secondary hover:underline">
          Link erneut anfordern
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="glass-panel mt-8 p-6">
        <p className="text-white">Dein Passwort wurde geändert. Du kannst dich jetzt einloggen.</p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-4 rounded-full bg-tigers-secondary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Zum Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel mt-8 flex flex-col gap-4 p-6">
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-white">
          Neues Passwort
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
        {isPending ? "Wird gespeichert…" : "Passwort speichern"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Neues Passwort vergeben</h1>

      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </section>
  );
}
