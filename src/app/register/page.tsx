"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Registrieren</h1>
      <p className="mt-2 text-white/70">Werde Teil der TigersZone-Community und tippe mit.</p>

      <form action={formAction} className="glass-panel mt-8 flex flex-col gap-4 p-6">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-white/80">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
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
            minLength={8}
            className="glass-panel-sm w-full px-4 py-2 text-white focus:outline-none"
          />
        </div>

        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-tigers-secondary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Wird erstellt…" : "Konto erstellen"}
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
