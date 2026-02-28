"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { EmbedRenderer } from "@/components/embed-renderer";
import { MarkdownPreview } from "@/components/markdown-preview";

type AdminPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  embedLink: string | null;
  createdAt: string;
};

const emptyForm = {
  title: "",
  slug: "",
  content: "",
  imageUrl: "",
  embedLink: ""
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState("");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        });
        const data = (await response.json()) as { authenticated: boolean };

        if (response.ok && data.authenticated) {
          setAuthenticated(true);
          await fetchPosts();
        }
      } finally {
        setSessionLoading(false);
      }
    }

    void checkSession();
  }, []);

  async function fetchPosts() {
    const response = await fetch("/api/posts", {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as AdminPost[];
    setPosts(data);
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      setStatus("Invalid password.");
      return;
    }

    setAuthenticated(true);
    setPassword("");
    setStatus("");
    await fetchPosts();
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include"
    });

    setAuthenticated(false);
    setPosts([]);
    setStatus("");
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (!form.title.trim() || !form.content.trim()) {
      setStatus("Title and content are required.");
      return;
    }

    setIsPublishing(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          slug: form.slug || undefined,
          content: form.content,
          imageUrl: form.imageUrl || null,
          embedLink: form.embedLink || null
        })
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus(data.error || "Failed to publish.");
        return;
      }

      setForm(emptyForm);
      setStatus("Post published.");
      await fetchPosts();
    } finally {
      setIsPublishing(false);
    }
  }

  async function uploadImage(file: File) {
    if (!cloudName || !uploadPreset) {
      setStatus("Cloudinary env vars are missing.");
      return;
    }

    setIsUploading(true);
    setStatus("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData
        }
      );

      if (!response.ok) {
        setStatus("Image upload failed.");
        return;
      }

      const data = (await response.json()) as { secure_url?: string };
      if (!data.secure_url) {
        setStatus("Image upload failed.");
        return;
      }

      updateField("imageUrl", data.secure_url);
      setStatus("Image uploaded.");
    } finally {
      setIsUploading(false);
    }
  }

  async function deletePost(slug: string) {
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) {
      return;
    }

    setDeletingSlug(slug);
    setStatus("");

    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setStatus(data.error || "Delete failed.");
        return;
      }

      setStatus("Post deleted.");
      await fetchPosts();
    } finally {
      setDeletingSlug("");
    }
  }

  if (sessionLoading) {
    return <p className="text-sm text-muted">Loading admin...</p>;
  }

  if (!authenticated) {
    return (
      <section className="mx-auto max-w-md">
        <h1 className="font-display text-4xl">Admin Login</h1>
        <form onSubmit={login} className="mt-6 space-y-4 rounded-xl border border-border bg-surface p-6">
          <label className="block space-y-2">
            <span className="text-sm text-muted">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              required
            />
          </label>
          {status ? <p className="text-sm text-red-600 dark:text-red-400">{status}</p> : null}
          <button
            type="submit"
            className="rounded-lg border border-border bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
          >
            Sign in
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Admin Dashboard</h1>
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted hover:text-foreground"
        >
          Logout
        </button>
      </div>

      {status ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-muted">{status}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handlePublish} className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-2xl">New Post</h2>

          <label className="block space-y-2">
            <span className="text-sm text-muted">Title</span>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-muted">Slug (optional)</span>
            <input
              value={form.slug}
              onChange={(event) => updateField("slug", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="leave blank to auto-generate"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-muted">Image URL</span>
            <input
              value={form.imageUrl}
              onChange={(event) => updateField("imageUrl", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="https://..."
            />
          </label>

          <div className="space-y-2">
            <span className="text-sm text-muted">Upload image to Cloudinary</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadImage(file);
                }
              }}
              disabled={isUploading}
              className="w-full text-sm file:mr-4 file:rounded-lg file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-sm file:text-muted"
            />
            {isUploading ? <p className="text-xs text-muted">Uploading...</p> : null}
          </div>

          <label className="block space-y-2">
            <span className="text-sm text-muted">Embed link (YouTube, Instagram, X)</span>
            <input
              value={form.embedLink}
              onChange={(event) => updateField("embedLink", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="https://..."
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-muted">Markdown content</span>
            <textarea
              value={form.content}
              onChange={(event) => updateField("content", event.target.value)}
              rows={14}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isPublishing}
            className="rounded-lg border border-border bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
        </form>

        <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-2xl">Preview</h2>

          {form.title ? <h3 className="font-display text-3xl">{form.title}</h3> : null}

          {form.imageUrl ? (
            <div className="overflow-hidden rounded-lg border border-border">
              <Image
                src={form.imageUrl}
                alt={form.title || "Preview image"}
                width={1200}
                height={700}
                className="h-auto w-full object-cover"
              />
            </div>
          ) : null}

          {form.embedLink ? <EmbedRenderer embedLink={form.embedLink} /> : null}
          {form.content ? <MarkdownPreview content={form.content} /> : <p className="text-sm text-muted">No content yet.</p>}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-2xl">Existing Posts</h2>
        {posts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No posts yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {posts.map((post) => (
              <li key={post.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-display text-xl">{post.title}</p>
                  <p className="text-xs text-muted">
                    /posts/{post.slug} - {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void deletePost(post.slug)}
                  disabled={deletingSlug === post.slug}
                  className="rounded-lg border border-border px-3 py-2 text-xs text-muted transition-colors hover:border-red-500 hover:text-red-500 disabled:opacity-50"
                >
                  {deletingSlug === post.slug ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
