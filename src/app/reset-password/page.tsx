"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition, type FormEvent } from "react";
import { resetPasswordAction } from "./actions";
import AuthShell, {
  AUTH_BUTTON_CLASS,
  AUTH_LINK_CLASS,
  AuthField,
} from "@/components/AuthShell";
import { PillActionButton } from "@/components/PillButton";

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
      <div className="text-center">
        <p className="text-[16px] leading-snug text-red-300">
          Ungültiger Link. Bitte fordere einen neuen an.
        </p>
        <Link
          href="/forgot-password"
          className={`${AUTH_LINK_CLASS} mt-4 inline-block text-[15px]`}
        >
          Link erneut anfordern
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="text-[16px] leading-snug text-white/85">
          Dein Passwort wurde geändert. Du kannst dich jetzt einloggen.
        </p>
        <div className="mt-4">
          <PillActionButton
            className={AUTH_BUTTON_CLASS}
            onClick={() => router.push("/login")}
          >
            Zum Login
          </PillActionButton>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthField
        id="password"
        label="Neues Passwort"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
      />
      <p className="-mt-2 text-[13px] text-white/55">Mindestens 8 Zeichen.</p>

      {error && (
        <p className="text-[14px] leading-snug text-red-300">{error}</p>
      )}

      <PillActionButton
        type="submit"
        disabled={isPending}
        className={`mt-1 ${AUTH_BUTTON_CLASS}`}
      >
        {isPending ? "Wird gespeichert…" : "Passwort speichern"}
      </PillActionButton>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Neues Passwort vergeben">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
