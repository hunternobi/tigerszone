import { Schema, models, model, type Document, type Types } from "mongoose";
import type { UserRole } from "@/types";

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["user", "redakteur", "admin"], default: "user" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const UserModel = models.User || model<UserDocument>("User", userSchema);
