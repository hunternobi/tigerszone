"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition, type FormEvent } from "react";
import { resendVerificationEmail } from "@/app/register/actions";
import AuthShell, {
  AUTH_BUTTON_CLASS,
  AUTH_LINK_CLASS,
  AuthField,
} from "@/components/AuthShell";
import { PillActionButton } from "@/components/PillButton";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">(
    "idle",
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setResendState("idle");
    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.code === "email-not-verified") {
        setNeedsVerification(true);
        setError(
          "Bitte bestätige zuerst deine E-Mail-Adresse. Schau in dein Postfach.",
        );
        return;
      }
      if (result?.code === "too-many-attempts") {
        setError(
          "Zu viele Login-Versuche. Bitte warte einige Minuten und versuche es erneut.",
        );
        return;
      }
      if (result?.error) {
        setError("E-Mail oder Passwort ist falsch.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    });
  }

  function handleResend() {
    setResendState("sending");
    startTransition(async () => {
      const result = await resendVerificationEmail(email);
      if (!result.success) {
        setResendState("idle");
        setError(
          result.error ?? "Bestätigungs-E-Mail konnte nicht gesendet werden.",
        );
        return;
      }
      setResendState("sent");
    });
  }

  return (
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
      <AuthField
        id="password"
        label="Passwort"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && (
        <p className="text-[0.875rem] leading-snug text-red-300">{error}</p>
      )}

      {needsVerification && (
        <button
          type="button"
          onClick={handleResend}
          disabled={resendState !== "idle"}
          className={`${AUTH_LINK_CLASS} text-left text-[0.875rem] disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {resendState === "sent"
            ? "Bestätigungs-E-Mail erneut gesendet."
            : resendState === "sending"
              ? "Wird gesendet…"
              : "Bestätigungs-E-Mail erneut senden"}
        </button>
      )}

      <PillActionButton
        type="submit"
        disabled={isPending}
        className={`mt-1 ${AUTH_BUTTON_CLASS}`}
      >
        <span key={isPending ? "pending" : "idle"}>
          {isPending ? "Wird eingeloggt…" : "Einloggen"}
        </span>
      </PillActionButton>

      <Link
        href="/forgot-password"
        className="text-center text-[0.9375rem] text-white/70 transition hover:text-white"
      >
        Passwort vergessen?
      </Link>
    </form>
  );
}

function RegisterLink() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const href = callbackUrl
    ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/register";

  return (
    <p>
      Noch kein Konto?{" "}
      <Link href={href} className={AUTH_LINK_CLASS}>
        Jetzt registrieren
      </Link>
    </p>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Login"
      subtitle="Melde dich an, um mitzutippen."
      footer={
        <Suspense fallback={null}>
          <RegisterLink />
        </Suspense>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
