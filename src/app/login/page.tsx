"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Login</h1>
      <p className="mt-2 text-white/70">Melde dich an, um mitzutippen.</p>

      <form action={formAction} className="glass-panel mt-8 flex flex-col gap-4 p-6">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-white/80">
            E-Mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
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
            name="password"
            type="password"
            required
            className="glass-panel-sm w-full px-4 py-2 text-white focus:outline-none"
          />
        </div>

        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-tigers-secondary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Wird eingeloggt…" : "Einloggen"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-white/60">
        Noch kein Konto?{" "}
        <Link href="/register" className="text-tigers-secondary hover:underline">
          Jetzt registrieren
        </Link>
      </p>
    </section>
  );
}
