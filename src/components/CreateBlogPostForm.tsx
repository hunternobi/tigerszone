"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createBlogPost } from "@/app/redaktion/actions";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CreateBlogPostForm() {
  const [title, setTitle] = useState("");
  const [publishedAt, setPublishedAt] = useState(todayIso);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await createBlogPost(title, publishedAt, content);
      if (!result.success) {
        setError(result.error ?? "Beitrag konnte nicht gespeichert werden.");
        return;
      }
      setTitle("");
      setContent("");
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-4 p-6">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-white/80">
          Titel
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="glass-panel-sm w-full px-4 py-2 text-white focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="publishedAt" className="mb-1 block text-sm font-medium text-white/80">
          Datum
        </label>
        <input
          id="publishedAt"
          type="date"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          required
          className="glass-panel-sm w-full px-4 py-2 text-white focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium text-white/80">
          Inhalt
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={8}
          placeholder="Absätze durch eine Leerzeile trennen"
          className="glass-panel-sm w-full px-4 py-2 text-white focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">Beitrag veröffentlicht.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 self-start rounded-full bg-tigers-secondary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Wird veröffentlicht…" : "Beitrag veröffentlichen"}
      </button>
    </form>
  );
}
