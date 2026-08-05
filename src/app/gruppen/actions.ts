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

export async function createGroup(name: string, isPublic: boolean): Promise<ActionResult> {
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
    isPublic,
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

export async function joinPublicGroup(groupId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  await dbConnect();
  const group = await GroupModel.findById(groupId);
  if (!group) return { success: false, error: "Gruppe nicht gefunden." };
  if (!group.isPublic) return { success: false, error: "Diese Gruppe ist nicht öffentlich." };

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
  isPublic: boolean;
  viewerRole: "owner" | "assistant" | "member";
}

export async function getMyGroups(): Promise<MyGroup[]> {
  const session = await auth();
  if (!session?.user) return [];

  await dbConnect();
  const memberships = await GroupMemberModel.find({ userId: session.user.id }).lean<
    { groupId: Types.ObjectId; role: "member" | "assistant" }[]
  >();
  const groupIds = memberships.map((membership) => membership.groupId);
  if (groupIds.length === 0) return [];

  const viewerRoleByGroup = new Map(
    memberships.map((membership) => [membership.groupId.toString(), membership.role])
  );

  const groups = await GroupModel.find({ _id: { $in: groupIds } }).lean<
    {
      _id: Types.ObjectId;
      name: string;
      inviteCode: string;
      ownerUserId: Types.ObjectId;
      isPublic: boolean;
    }[]
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

  return groups.map((group) => {
    const isOwner = group.ownerUserId.toString() === session.user.id;
    return {
      _id: group._id.toString(),
      name: group.name,
      inviteCode: group.inviteCode,
      memberCount: countMap.get(group._id.toString()) ?? 1,
      isOwner,
      ownerName: ownerNameById.get(group.ownerUserId.toString()) ?? "Unbekannt",
      isPublic: group.isPublic,
      viewerRole: isOwner ? "owner" : (viewerRoleByGroup.get(group._id.toString()) ?? "member"),
    };
  });
}

export interface PublicGroup {
  _id: string;
  name: string;
  memberCount: number;
  ownerName: string;
}

export async function getPublicGroups(): Promise<PublicGroup[]> {
  const session = await auth();
  if (!session?.user) return [];

  await dbConnect();
  const myMemberships = await GroupMemberModel.find({ userId: session.user.id }).select(
    "groupId"
  );
  const myGroupIds = myMemberships.map((membership) => membership.groupId);

  const groups = await GroupModel.find({ isPublic: true, _id: { $nin: myGroupIds } }).lean<
    { _id: Types.ObjectId; name: string; ownerUserId: Types.ObjectId }[]
  >();
  if (groups.length === 0) return [];

  const groupIds = groups.map((group) => group._id);
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
    memberCount: countMap.get(group._id.toString()) ?? 0,
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

export async function promoteToAssistant(
  groupId: string,
  targetUserId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  await dbConnect();
  const group = await GroupModel.findById(groupId).select("ownerUserId").lean<{
    ownerUserId: Types.ObjectId;
  } | null>();
  if (!group) return { success: false, error: "Gruppe nicht gefunden." };
  if (group.ownerUserId.toString() !== session.user.id) {
    return { success: false, error: "Nur der Head Coach kann befördern." };
  }
  if (targetUserId === session.user.id || targetUserId === group.ownerUserId.toString()) {
    return { success: false, error: "Ungültige Auswahl." };
  }

  await GroupMemberModel.updateOne({ groupId, userId: targetUserId }, { role: "assistant" });

  revalidatePath("/gruppen");
  revalidatePath("/tippspiel");
  return { success: true };
}

export async function demoteAssistant(
  groupId: string,
  targetUserId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  await dbConnect();
  const group = await GroupModel.findById(groupId).select("ownerUserId").lean<{
    ownerUserId: Types.ObjectId;
  } | null>();
  if (!group) return { success: false, error: "Gruppe nicht gefunden." };
  if (group.ownerUserId.toString() !== session.user.id) {
    return { success: false, error: "Nur der Head Coach kann degradieren." };
  }

  await GroupMemberModel.updateOne({ groupId, userId: targetUserId }, { role: "member" });

  revalidatePath("/gruppen");
  revalidatePath("/tippspiel");
  return { success: true };
}

export async function kickGroupMember(
  groupId: string,
  targetUserId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  await dbConnect();
  const group = await GroupModel.findById(groupId).select("ownerUserId").lean<{
    ownerUserId: Types.ObjectId;
  } | null>();
  if (!group) return { success: false, error: "Gruppe nicht gefunden." };

  const isOwner = group.ownerUserId.toString() === session.user.id;
  if (!isOwner) {
    const membership = await GroupMemberModel.findOne({
      groupId,
      userId: session.user.id,
    }).select("role").lean<{ role: "member" | "assistant" } | null>();
    if (!membership || membership.role !== "assistant") {
      return { success: false, error: "Keine Berechtigung." };
    }
  }

  if (targetUserId === group.ownerUserId.toString()) {
    return { success: false, error: "Der Head Coach kann nicht entfernt werden." };
  }
  if (targetUserId === session.user.id) {
    return { success: false, error: "Du kannst dich nicht selbst entfernen." };
  }

  await GroupMemberModel.deleteOne({ groupId, userId: targetUserId });

  revalidatePath("/gruppen");
  revalidatePath("/tippspiel");
  return { success: true };
}
