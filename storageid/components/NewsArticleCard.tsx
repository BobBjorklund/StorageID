"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type NewsArticleCardProps = {
  /** Full URL to the article */
  url: string;
  /** Short, human-readable headline */
  title?: string;
  /** Brief summary or dek of the article */
  description?: string;
  /** Optional preview image URL */
  imageUrl?: string;
  /** Start expanded (defaults to false) */
  defaultOpen?: boolean;
  /** Optional className to customize outer card */
  className?: string;
};

export default function NewsArticleCard({
  url,
  title: initialTitle,
  description: initialDescription,
  imageUrl: initialImageUrl,
  defaultOpen = false,
  className = "",
}: NewsArticleCardProps) {
  const [meta, setMeta] = useState({
    title: initialTitle ?? "",
    description: initialDescription ?? "",
    imageUrl: initialImageUrl ?? "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialTitle || !initialDescription || !initialImageUrl) {
      setLoading(true);
      fetch(`/api/article-meta?url=${encodeURIComponent(url)}`)
        .then((res) => res.json())
        .then((data) => {
          setMeta({
            title: data.title || initialTitle || url,
            description: data.description || initialDescription || "",
            imageUrl: data.imageUrl || initialImageUrl || "",
          });
        })
        .catch((err) => {
          console.error("Failed to load metadata", err);
        })
        .finally(() => setLoading(false));
    }
  }, [url, initialTitle, initialDescription, initialImageUrl]);

  const host = useMemo(() => {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return undefined;
    }
  }, [url]);

  const title = meta.title || url;
  const description = meta.description;
  const imageUrl = meta.imageUrl;

  return (
    <details
      className={`group rounded-2xl border border-gray-200 bg-white/70 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${className}`}
      open={defaultOpen}
    >
      <summary
        className="flex cursor-pointer list-none items-start gap-3 px-4 py-3 sm:items-center"
        aria-label={`Toggle article: ${title}`}
      >
        <div
          aria-hidden
          className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white transition-transform group-open:rotate-180 dark:border-gray-700 dark:bg-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-base font-semibold text-gray-900 hover:underline dark:text-gray-50"
              title={title}
            >
              {loading ? "Loading…" : title}
            </Link>
            <span
              className="hidden text-xs text-gray-400 sm:inline"
              aria-hidden
            >
              ·
            </span>
            {host && (
              <span
                className="hidden truncate text-xs text-gray-500 sm:inline dark:text-gray-400"
                title={host}
              >
                {host}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>
      </summary>

      <div className="mx-4 border-t border-gray-200 dark:border-gray-800" />

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-[220px,1fr]">
        {imageUrl ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Article preview image"
              className="h-44 w-full object-cover sm:h-full"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : (
          <div className="hidden sm:block" aria-hidden />
        )}

        <div className="flex min-w-0 flex-col gap-3">
          {description && (
            <p className="text-sm text-gray-700 dark:text-gray-200">
              {description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
              aria-label={`Open article in a new tab: ${title}`}
            >
              Read article
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="ml-1.5 h-4 w-4"
                aria-hidden
              >
                <path d="M14 3h7v7" />
                <path d="M10 14L21 3" />
                <path d="M21 14v7h-7" />
                <path d="M3 10h7V3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </details>
  );
}
