import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getAllBlogPosts } from "@/lib/blogPosts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/tippspiel", "/spieltagsblog", "/community"];
  const posts = await getAllBlogPosts();

  return [
    ...routes.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/spieltagsblog/${post._id}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
