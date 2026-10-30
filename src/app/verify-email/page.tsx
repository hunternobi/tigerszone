import type { Metadata } from "next";
import Link from "next/link";
import AuthShell, { AUTH_LINK_CLASS } from "@/components/AuthShell";
import PillButton from "@/components/PillButton";
import { verifyEmailToken } from "./actions";

export const metadata: Metadata = {
  title: "E-Mail bestätigen",
  robots: { index: false, follow: false },
};

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;
  const result = await verifyEmailToken(token ?? "");

  return (
    <AuthShell title="E-Mail-Bestätigung">
      <div className="text-center">
        {result.success ? (
          <>
            <p className="text-[1rem] leading-snug text-white/85">
              Deine E-Mail-Adresse wurde bestätigt. Du kannst dich jetzt
              einloggen.
            </p>
            <div className="mt-4">
              <PillButton href="/login">Zum Login</PillButton>
            </div>
          </>
        ) : (
          <>
            <p className="text-[1rem] leading-snug text-red-300">
              {result.error}
            </p>
            <Link
              href="/login"
              className={`${AUTH_LINK_CLASS} mt-4 inline-block text-[0.9375rem]`}
            >
              Zurück zum Login
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}
