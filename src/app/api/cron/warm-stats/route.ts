import { NextResponse } from "next/server";
import { getLeagueStats } from "@/lib/pennyDel";

export const maxDuration = 60;

// Runs shortly after midnight German time. The league numbers are cached per German day, so loading them
// here means the first visitor of the day does not wait for the penny-del.org requests.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getLeagueStats();
  return NextResponse.json({ ok: stats !== null, fetchedAt: stats?.fetchedAt ?? null });
}
