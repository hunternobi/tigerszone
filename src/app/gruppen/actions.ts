"use server";

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import { GroupModel } from "@/models/Group";
import { GroupMemberModel } from "@/models/GroupMember";
import { GroupInviteModel } from "@/models/GroupInvite";
import { UserModel } from "@/models/User";

const ACTIVE_GROUP_COOKIE = "activeGroupId";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function generateInviteCode(): string {
  return randomBytes(6).toString("hex");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function isGroupMember(groupId: string, userId: string): Promise<boolean> {
  const membership = await GroupMemberModel.findOne({ groupId, userId }).select("_id");
  return membership !== null;
}

export async function createGroup(name: string, isPublic: boolean): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { success: false, error: "Gruppenname muss mindestens 2 Zeichen lang sein." };
  }

  await dbConnect();

  const nameLower = trimmed.toLowerCase();
  const nameTaken = await GroupModel.findOne({ nameLower });
  if (nameTaken) {
    return { success: false, error: "Dieser Gruppenname ist bereits vergeben." };
  }

  let inviteCode = generateInviteCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await GroupModel.findOne({ inviteCode });
    if (!existing) break;
    inviteCode = generateInviteCode();
  }

  const group = await GroupModel.create({
    name: trimmed,
    nameLower,
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

export interface UserGroup {
  _id: string;
  name: string;
}

export async function getGroupsForUser(userId: string): Promise<UserGroup[]> {
  await dbConnect();
  const memberships = await GroupMemberModel.find({ userId }).select("groupId").lean<
    { groupId: Types.ObjectId }[]
  >();
  if (memberships.length === 0) return [];

  const groups = await GroupModel.find({ _id: { $in: memberships.map((m) => m.groupId) } })
    .select("name")
    .lean<{ _id: Types.ObjectId; name: string }[]>();

  return groups.map((group) => ({ _id: group._id.toString(), name: group.name }));
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

export async function renameGroup(groupId: string, name: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { success: false, error: "Gruppenname muss mindestens 2 Zeichen lang sein." };
  }

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

  const nameLower = trimmed.toLowerCase();
  const nameTaken = await GroupModel.findOne({ nameLower, _id: { $ne: groupId } }).select("_id");
  if (nameTaken) {
    return { success: false, error: "Dieser Gruppenname ist bereits vergeben." };
  }

  await GroupModel.updateOne({ _id: groupId }, { name: trimmed, nameLower });

  revalidatePath("/gruppen");
  revalidatePath("/tippspiel");
  return { success: true };
}

export async function leaveGroup(groupId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  await dbConnect();
  const group = await GroupModel.findById(groupId).select("ownerUserId").lean<{
    ownerUserId: Types.ObjectId;
  } | null>();
  if (!group) return { success: false, error: "Gruppe nicht gefunden." };

  const isOwner = group.ownerUserId.toString() === session.user.id;

  if (isOwner) {
    const assistant = await GroupMemberModel.findOne({ groupId, role: "assistant" })
      .sort({ joinedAt: 1 })
      .lean<{ userId: Types.ObjectId } | null>();

    let successorId = assistant?.userId;
    if (!successorId) {
      const oldestOther = await GroupMemberModel.findOne({
        groupId,
        userId: { $ne: session.user.id },
      })
        .sort({ joinedAt: 1 })
        .lean<{ userId: Types.ObjectId } | null>();
      successorId = oldestOther?.userId;
    }

    if (successorId) {
      await GroupModel.updateOne({ _id: groupId }, { ownerUserId: successorId });
      await GroupMemberModel.updateOne({ groupId, userId: successorId }, { role: "member" });
      await GroupMemberModel.deleteOne({ groupId, userId: session.user.id });
    } else {
      // No other members left to hand the group to — dissolve it.
      await GroupMemberModel.deleteMany({ groupId });
      await GroupModel.deleteOne({ _id: groupId });
    }
  } else {
    await GroupMemberModel.deleteOne({ groupId, userId: session.user.id });
  }

  const cookieStore = await cookies();
  if (cookieStore.get(ACTIVE_GROUP_COOKIE)?.value === groupId) {
    cookieStore.delete(ACTIVE_GROUP_COOKIE);
  }

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

export interface InvitableUser {
  userId: string;
  name: string;
}

export async function searchInvitableUsers(
  groupId: string,
  query: string
): Promise<InvitableUser[]> {
  const session = await auth();
  if (!session?.user) return [];

  await dbConnect();
  if (!(await isGroupMember(groupId, session.user.id))) return [];

  const [members, pendingInvites] = await Promise.all([
    GroupMemberModel.find({ groupId }).select("userId").lean<{ userId: Types.ObjectId }[]>(),
    GroupInviteModel.find({ groupId }).select("invitedUserId").lean<
      { invitedUserId: Types.ObjectId }[]
    >(),
  ]);
  const excludedIds = [
    ...members.map((m) => m.userId),
    ...pendingInvites.map((i) => i.invitedUserId),
    session.user.id,
  ];

  const trimmed = query.trim();
  const filter: Record<string, unknown> = { _id: { $nin: excludedIds } };
  if (trimmed.length >= 2) {
    filter.name = { $regex: escapeRegex(trimmed), $options: "i" };
  }

  const users = await UserModel.find(filter)
    .select("name")
    .sort({ name: 1 })
    .limit(100)
    .lean<{ _id: Types.ObjectId; name: string }[]>();

  return users.map((user) => ({ userId: user._id.toString(), name: user.name }));
}

export async function inviteUserToGroup(
  groupId: string,
  targetUserId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  await dbConnect();
  const group = await GroupModel.findById(groupId).select("name").lean<{ name: string } | null>();
  if (!group) return { success: false, error: "Gruppe nicht gefunden." };

  if (!(await isGroupMember(groupId, session.user.id))) {
    return { success: false, error: "Keine Berechtigung." };
  }
  if (targetUserId === session.user.id) {
    return { success: false, error: "Du kannst dich nicht selbst einladen." };
  }

  const targetUser = await UserModel.findById(targetUserId).select("_id");
  if (!targetUser) return { success: false, error: "Spieler nicht gefunden." };

  if (await isGroupMember(groupId, targetUserId)) {
    return { success: false, error: "Spieler ist bereits Mitglied." };
  }

  try {
    await GroupInviteModel.create({
      groupId,
      invitedUserId: targetUserId,
      invitedByUserId: session.user.id,
    });
  } catch {
    return { success: false, error: "Spieler wurde bereits eingeladen." };
  }

  return { success: true };
}

export interface MyGroupInvite {
  inviteId: string;
  groupId: string;
  groupName: string;
  invitedByName: string;
}

export async function getMyGroupInvites(userId?: string): Promise<MyGroupInvite[]> {
  if (!userId) {
    const session = await auth();
    if (!session?.user) return [];
    userId = session.user.id;
  }

  await dbConnect();
  const invites = await GroupInviteModel.find({ invitedUserId: userId })
    .sort({ createdAt: -1 })
    .lean<
      {
        _id: Types.ObjectId;
        groupId: Types.ObjectId;
        invitedByUserId: Types.ObjectId;
      }[]
    >();
  if (invites.length === 0) return [];

  const groupIds = invites.map((invite) => invite.groupId);
  const inviterIds = invites.map((invite) => invite.invitedByUserId);

  const [groups, inviters] = await Promise.all([
    GroupModel.find({ _id: { $in: groupIds } })
      .select("name")
      .lean<{ _id: Types.ObjectId; name: string }[]>(),
    UserModel.find({ _id: { $in: inviterIds } })
      .select("name")
      .lean<{ _id: Types.ObjectId; name: string }[]>(),
  ]);
  const groupNameById = new Map(groups.map((g) => [g._id.toString(), g.name]));
  const inviterNameById = new Map(inviters.map((u) => [u._id.toString(), u.name]));

  return invites.map((invite) => ({
    inviteId: invite._id.toString(),
    groupId: invite.groupId.toString(),
    groupName: groupNameById.get(invite.groupId.toString()) ?? "Unbekannte Gruppe",
    invitedByName: inviterNameById.get(invite.invitedByUserId.toString()) ?? "Unbekannt",
  }));
}

export async function acceptGroupInvite(inviteId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  await dbConnect();
  const invite = await GroupInviteModel.findById(inviteId).lean<{
    groupId: Types.ObjectId;
    invitedUserId: Types.ObjectId;
  } | null>();
  if (!invite || invite.invitedUserId.toString() !== session.user.id) {
    return { success: false, error: "Einladung nicht gefunden." };
  }

  const groupId = invite.groupId.toString();
  const alreadyMember = await isGroupMember(groupId, session.user.id);
  if (!alreadyMember) {
    await GroupMemberModel.create({ groupId, userId: session.user.id });
  }
  await GroupInviteModel.deleteOne({ _id: inviteId });

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_GROUP_COOKIE, groupId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  revalidatePath("/profile");
  revalidatePath("/gruppen");
  revalidatePath("/tippspiel");
  return { success: true };
}

export async function declineGroupInvite(inviteId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  await dbConnect();
  const invite = await GroupInviteModel.findById(inviteId).select("invitedUserId").lean<{
    invitedUserId: Types.ObjectId;
  } | null>();
  if (!invite || invite.invitedUserId.toString() !== session.user.id) {
    return { success: false, error: "Einladung nicht gefunden." };
  }

  await GroupInviteModel.deleteOne({ _id: inviteId });

  revalidatePath("/profile");
  return { success: true };
}
