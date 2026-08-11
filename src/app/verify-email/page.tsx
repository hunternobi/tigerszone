import type { Metadata } from "next";
import Link from "next/link";
import { verifyEmailToken } from "./actions";

export const metadata: Metadata = {
  title: "E-Mail bestätigen",
  robots: { index: false, follow: false },
};

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;
  const result = await verifyEmailToken(token ?? "");

  return (
    <section className="mx-auto max-w-md px-6 py-16 text-center">
      <h1 className="text-3xl font-bold text-white">E-Mail-Bestätigung</h1>

      <div className="glass-panel mt-8 p-6">
        {result.success ? (
          <>
            <p className="text-white">
              Deine E-Mail-Adresse wurde bestätigt. Du kannst dich jetzt einloggen.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-full bg-tigers-secondary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Zum Login
            </Link>
          </>
        ) : (
          <>
            <p className="text-red-400">{result.error}</p>
            <Link href="/login" className="mt-4 inline-block text-sm text-tigers-secondary hover:underline">
              Zurück zum Login
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
