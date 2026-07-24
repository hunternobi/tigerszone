"use server";

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import { GroupModel } from "@/models/Group";
import { GroupMemberModel } from "@/models/GroupMember";
import { UserModel } from "@/models/User";

const ACTIVE_GROUP_COOKIE = "activeGroupId";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function generateInviteCode(): string {
  return randomBytes(6).toString("hex");
}

export async function createGroup(name: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { success: false, error: "Gruppenname muss mindestens 2 Zeichen lang sein." };
  }

  await dbConnect();

  let inviteCode = generateInviteCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await GroupModel.findOne({ inviteCode });
    if (!existing) break;
    inviteCode = generateInviteCode();
  }

  const group = await GroupModel.create({
    name: trimmed,
    inviteCode,
    ownerUserId: session.user.id,
  });
  await GroupMemberModel.create({ groupId: group._id, userId: session.user.id });

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_GROUP_COOKIE, group._id.toString(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  revalidatePath("/gruppen");
  revalidatePath("/tippspiel");

  return { success: true };
}

export async function joinGroupByInviteCode(inviteCode: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  await dbConnect();
  const group = await GroupModel.findOne({ inviteCode: inviteCode.trim() });
  if (!group) return { success: false, error: "Einladungslink ist ungültig." };

  const existingMembership = await GroupMemberModel.findOne({
    groupId: group._id,
    userId: session.user.id,
  });
  if (!existingMembership) {
    await GroupMemberModel.create({ groupId: group._id, userId: session.user.id });
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_GROUP_COOKIE, group._id.toString(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  revalidatePath("/gruppen");
  revalidatePath("/tippspiel");

  return { success: true };
}

export async function setActiveGroup(groupId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_GROUP_COOKIE, groupId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  revalidatePath("/tippspiel");
  revalidatePath("/gruppen");
}

export async function getActiveGroupId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_GROUP_COOKIE)?.value ?? null;
}

export interface MyGroup {
  _id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
  isOwner: boolean;
  ownerName: string;
}

export async function getMyGroups(): Promise<MyGroup[]> {
  const session = await auth();
  if (!session?.user) return [];

  await dbConnect();
  const memberships = await GroupMemberModel.find({ userId: session.user.id }).lean<
    { groupId: Types.ObjectId }[]
  >();
  const groupIds = memberships.map((membership) => membership.groupId);
  if (groupIds.length === 0) return [];

  const groups = await GroupModel.find({ _id: { $in: groupIds } }).lean<
    { _id: Types.ObjectId; name: string; inviteCode: string; ownerUserId: Types.ObjectId }[]
  >();

  const counts = await GroupMemberModel.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { groupId: { $in: groupIds } } },
    { $group: { _id: "$groupId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((entry) => [entry._id.toString(), entry.count]));

  const ownerIds = groups.map((group) => group.ownerUserId);
  const owners = await UserModel.find({ _id: { $in: ownerIds } })
    .select("name")
    .lean<{ _id: Types.ObjectId; name: string }[]>();
  const ownerNameById = new Map(owners.map((owner) => [owner._id.toString(), owner.name]));

  return groups.map((group) => ({
    _id: group._id.toString(),
    name: group.name,
    inviteCode: group.inviteCode,
    memberCount: countMap.get(group._id.toString()) ?? 1,
    isOwner: group.ownerUserId.toString() === session.user.id,
    ownerName: ownerNameById.get(group.ownerUserId.toString()) ?? "Unbekannt",
  }));
}

export async function getGroupPreview(
  inviteCode: string
): Promise<{ name: string; ownerName: string } | null> {
  await dbConnect();
  const group = await GroupModel.findOne({ inviteCode: inviteCode.trim() }).lean<{
    name: string;
    ownerUserId: Types.ObjectId;
  } | null>();
  if (!group) return null;

  const owner = await UserModel.findById(group.ownerUserId).select("name").lean<{
    name: string;
  } | null>();

  return { name: group.name, ownerName: owner?.name ?? "Unbekannt" };
}
