"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition, type FormEvent } from "react";
import { registerAction } from "./actions";
import AuthShell, {
  AUTH_BUTTON_CLASS,
  AUTH_LINK_CLASS,
  AuthField,
} from "@/components/AuthShell";
import { PillActionButton } from "@/components/PillButton";

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
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

      if (result.requiresVerification) {
        setCheckEmail(true);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        setError("Konto erstellt. Bitte logge dich manuell ein.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  }

  if (checkEmail) {
    return (
      <div className="text-center">
        <p className="font-ui text-[1.25rem] font-semibold tracking-tight text-white">
          Fast geschafft!
        </p>
        <p className="mt-2 text-[1rem] leading-snug text-white/85">
          Wir haben dir eine E-Mail an{" "}
          <strong className="text-white">{email}</strong> geschickt. Klicke auf
          den Bestätigungslink darin, um dein Konto zu aktivieren.
        </p>
        <p className="mt-3 text-[0.875rem] leading-snug text-white/60">
          Nichts angekommen? Bitte auch im Spam- bzw. Junk-Ordner nachschauen.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthField
        id="name"
        label="Benutzername"
        type="text"
        autoComplete="username"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
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
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
      />
      <p className="-mt-2 text-[0.8125rem] text-white/55">Mindestens 8 Zeichen.</p>

      {error && (
        <p className="text-[0.875rem] leading-snug text-red-300">{error}</p>
      )}

      <PillActionButton
        type="submit"
        disabled={isPending}
        className={`mt-1 ${AUTH_BUTTON_CLASS}`}
      >
        {isPending ? "Wird erstellt…" : "Konto erstellen"}
      </PillActionButton>
    </form>
  );
}

function LoginLink() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const href = callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/login";

  return (
    <p>
      Schon registriert?{" "}
      <Link href={href} className={AUTH_LINK_CLASS}>
        Jetzt einloggen
      </Link>
    </p>
  );
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="Registrieren"
      subtitle="Werde Teil der TigersZone-Community und tippe mit."
      footer={
        <Suspense fallback={null}>
          <LoginLink />
        </Suspense>
      }
    >
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
