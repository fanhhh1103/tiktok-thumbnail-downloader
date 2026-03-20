"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { locales, type Locale, t } from "../i18n";

type ResolveOk = {
  ok: true;
  inputUrl: string;
  expandedUrl?: string;
  canonicalUrl?: string;
  videoId?: string;
  thumbnailUrl: string;
  title?: string;
  authorName?: string;
  providerName?: string;
};

type ResolveErr = { ok: false; error: string };

function isProbablyUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function localeLabel(l: Locale) {
  if (l === "en") return "English";
  if (l === "zh") return "中文";
  if (l === "ja") return "日本語";
  return "Español";
}

export default function LocaleHomeClient({ locale }: { locale: Locale }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResolveOk | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => isProbablyUrl(url.trim()), [url]);

  const downloadName = useMemo(() => {
    if (!result) return "";
    const parts: string[] = [];
    if (result.videoId) parts.push(result.videoId);
    if (result.title) parts.push(result.title);
    const joined = parts.join(" - ").trim();
    return joined.length ? joined : result.videoId ?? "tiktok-thumbnail";
  }, [result]);

  async function onResolve() {
    const input = url.trim();
    if (!isProbablyUrl(input)) {
      setError(t(locale, "invalidUrl"));
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/resolve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: input }),
      });

      const data = (await res.json()) as ResolveOk | ResolveErr;
      if (!res.ok || !data.ok) {
        setError("error" in data ? data.error : t(locale, "parseFailed"));
        return;
      }

      setResult(data);
    } catch {
      setError(t(locale, "networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {t(locale, "appTitle")}
              </h1>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {t(locale, "appSubtitle")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {locales.map((l) => (
                <Link
                  key={l}
                  href={`/${l}`}
                  className={`rounded-xl border px-3 py-1.5 text-sm transition ${
                    l === locale
                      ? "border-black/20 bg-black text-white dark:border-white/20 dark:bg-white dark:text-black"
                      : "border-black/10 bg-white hover:bg-black/[.04] dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-white/10"
                  }`}
                >
                  {localeLabel(l)}
                </Link>
              ))}
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950 sm:p-6">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium" htmlFor="tiktok-url">
              {t(locale, "inputLabel")}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="tiktok-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t(locale, "inputPlaceholder")}
                className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none ring-0 transition focus:border-black/20 dark:border-white/10 dark:bg-black dark:focus:border-white/20"
                autoComplete="off"
                inputMode="url"
              />
              <button
                type="button"
                onClick={onResolve}
                disabled={!canSubmit || loading}
                className="h-11 shrink-0 rounded-xl bg-black px-5 text-sm font-medium text-white transition disabled:opacity-50 dark:bg-white dark:text-black"
              >
                {loading ? t(locale, "resolving") : t(locale, "resolveBtn")}
              </button>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            ) : null}
          </div>
        </section>

        {result ? (
          <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="aspect-[9/16] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 sm:w-64">
                <img
                  src={result.thumbnailUrl}
                  alt={result.title ? `Thumbnail: ${result.title}` : "TikTok thumbnail"}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t(locale, "source")}: {result.providerName ?? "TikTok"}
                </div>
                {result.expandedUrl && result.expandedUrl !== result.inputUrl ? (
                  <div className="break-all text-xs leading-5 text-zinc-500 dark:text-zinc-500">
                    {t(locale, "expanded")}: {result.expandedUrl}
                  </div>
                ) : null}
                <div className="text-base font-semibold leading-6">
                  {result.title?.trim() ? result.title : t(locale, "titleFallback")}
                </div>
                {result.authorName ? (
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {t(locale, "author")}: {result.authorName}
                  </div>
                ) : null}
                <div className="pt-2">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <a
                      className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                      href={`/api/download?url=${encodeURIComponent(result.thumbnailUrl)}&name=${encodeURIComponent(downloadName)}`}
                    >
                      {t(locale, "download")}
                    </a>
                    <a
                      className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-2 text-sm font-medium transition hover:bg-black/[.04] dark:border-white/10 dark:hover:bg-white/10"
                      href={result.thumbnailUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t(locale, "openOriginal")}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <nav className="flex gap-4 text-sm">
          <Link href={`/${locale}/about`} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            {t(locale, "navAbout")}
          </Link>
          <Link href={`/${locale}/contact`} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            {t(locale, "navContact")}
          </Link>
          <Link href={`/${locale}/privacy`} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            {t(locale, "navPrivacy")}
          </Link>
          <Link href={`/${locale}/terms`} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            {t(locale, "navTerms")}
          </Link>
        </nav>

        <footer className="text-xs leading-5 text-zinc-500 dark:text-zinc-500">
          {t(locale, "footer")}
        </footer>
      </main>
    </div>
  );
}

