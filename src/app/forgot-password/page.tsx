"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { forgotPasswordAction } from "./actions";
import AuthShell, {
  AUTH_BUTTON_CLASS,
  AUTH_LINK_CLASS,
  AuthField,
} from "@/components/AuthShell";
import { PillActionButton } from "@/components/PillButton";

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
    <AuthShell
      title="Passwort vergessen"
      subtitle="Gib deine E-Mail-Adresse ein, wir schicken dir einen Link zum Zurücksetzen."
      footer={
        <Link href="/login" className={AUTH_LINK_CLASS}>
          Zurück zum Login
        </Link>
      }
    >
      {sent ? (
        <p className="text-center text-[16px] leading-snug text-white/85">
          Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir
          einen Link zum Zurücksetzen deines Passworts geschickt.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AuthField
            id="email"
            label="E-Mail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <p className="text-[14px] leading-snug text-red-300">{error}</p>
          )}

          <PillActionButton
            type="submit"
            disabled={isPending}
            className={`mt-1 ${AUTH_BUTTON_CLASS}`}
          >
            {isPending ? "Wird gesendet…" : "Link anfordern"}
          </PillActionButton>
        </form>
      )}
    </AuthShell>
  );
}
