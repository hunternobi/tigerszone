import { dbConnect } from "@/lib/mongodb";
import { BlogPostModel, type BlogPostDocument } from "@/models/BlogPost";
import type { BlogPost } from "@/types";

function serializeBlogPost(doc: BlogPostDocument): BlogPost {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    content: doc.content,
    publishedAt: doc.publishedAt.toISOString(),
    authorName: doc.authorName,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  await dbConnect();
  const docs = await BlogPostModel.find()
    .sort({ publishedAt: -1 })
    .lean<BlogPostDocument[]>();
  return docs.map(serializeBlogPost);
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  await dbConnect();
  const doc = await BlogPostModel.findById(id).lean<BlogPostDocument | null>();
  return doc ? serializeBlogPost(doc) : null;
}
