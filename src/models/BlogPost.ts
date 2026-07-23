import { Schema, models, model, type Document, type Types } from "mongoose";

export interface BlogPostDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  content: string;
  publishedAt: Date;
  authorName: string;
  createdAt: Date;
}

const blogPostSchema = new Schema<BlogPostDocument>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    authorName: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const BlogPostModel =
  models.BlogPost || model<BlogPostDocument>("BlogPost", blogPostSchema);
