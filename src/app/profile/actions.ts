"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { TIGERS_ROSTER } from "@/lib/tigersRoster";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function getFavoritePlayerId(userId: string): Promise<string | null> {
  await dbConnect();
  const user = await UserModel.findById(userId).select("favoritePlayerId").lean<{
    favoritePlayerId?: string;
  } | null>();
  return user?.favoritePlayerId ?? null;
}

export async function updateFavoritePlayer(playerId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  if (playerId !== "" && !TIGERS_ROSTER.some((player) => player.id === playerId)) {
    return { success: false, error: "Ungültiger Spieler." };
  }

  await dbConnect();
  if (playerId === "") {
    await UserModel.updateOne({ _id: session.user.id }, { $unset: { favoritePlayerId: "" } });
  } else {
    await UserModel.updateOne({ _id: session.user.id }, { favoritePlayerId: playerId });
  }

  revalidatePath("/profile");
  return { success: true };
}
