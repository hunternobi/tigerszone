"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

/** "Abmelden" as a quiet pill, used on the profile page (on a phone the top bar has no menu for it). */
export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="font-ui inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 text-[0.9375rem] font-semibold text-white transition active:scale-[0.97]"
    >
      <LogOut size={16} />
      Abmelden
    </button>
  );
}
