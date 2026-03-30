import { NextResponse } from "next/server";

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

function toErr(message: string, status = 400) {
  return NextResponse.json<ResolveErr>({ ok: false, error: message }, { status });
}

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map<
  string,
  { expiresAt: number; value: ResolveOk | { ok: false; error: string; status: number } }
>();

function getCached(key: string) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function setCached(
  key: string,
  value: ResolveOk | { ok: false; error: string; status: number },
  ttlMs = CACHE_TTL_MS,
) {
  cache.set(key, { expiresAt: Date.now() + ttlMs, value });
}

function withTimeout(ms: number) {
  return AbortSignal.timeout(ms);
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit,
  opts: { tries: number; timeoutMs: number },
) {
  let lastErr: unknown = null;
  for (let i = 0; i < opts.tries; i++) {
    try {
      const res = await fetch(input, { ...init, signal: withTimeout(opts.timeoutMs) });
      if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
        lastErr = new Error(`upstream status ${res.status}`);
        // small backoff
        await new Promise((r) => setTimeout(r, 250 * (i + 1)));
        continue;
      }
      return res;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 250 * (i + 1)));
    }
  }
  throw lastErr ?? new Error("fetch failed");
}

function extractVideoId(u: URL) {
  // Common: /@user/video/1234567890
  const m = u.pathname.match(/\/video\/(\d{8,30})/);
  if (m?.[1]) return m[1];
  // Photo mode sometimes uses /photo/...
  const m2 = u.pathname.match(/\/photo\/(\d{8,30})/);
  return m2?.[1] ?? undefined;
}

function extractHandle(u: URL) {
  const m = u.pathname.match(/^\/@([^\/]+)/);
  return m?.[1] ? decodeURIComponent(m[1]) : undefined;
}

async function expandTikTokUrl(inputUrl: URL) {
  const host = inputUrl.hostname.toLowerCase();
  const isShort =
    host === "vm.tiktok.com" ||
    host === "vt.tiktok.com" ||
    host.endsWith(".tiktok.com") ||
    host === "tiktok.com" ||
    host === "www.tiktok.com";

  if (!isShort) return { expandedUrl: inputUrl.toString(), expanded: inputUrl };

  // Follow redirects once via GET, but don't read body.
  try {
    const res = await fetchWithRetry(inputUrl.toString(), {
      method: "GET",
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
      },
      cache: "no-store",
    }, { tries: 2, timeoutMs: 6000 });

    // In node/next, final URL is available on Response.url
    const finalUrl = res.url || inputUrl.toString();
    const expanded = new URL(finalUrl);
    return { expandedUrl: finalUrl, expanded };
  } catch {
    return { expandedUrl: inputUrl.toString(), expanded: inputUrl };
  }
}

function pickFirstMetaContent(html: string, keys: string[]) {
  // Try property="og:image" and name="twitter:image"
  for (const key of keys) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=[\\\"']${key}[\\\"'][^>]*content=[\\\"']([^\\\"']+)[\\\"'][^>]*>`,
      "i",
    );
    const m = html.match(re);
    if (m?.[1]) return m[1];
  }
  // Sometimes content comes before property/name
  for (const key of keys) {
    const re = new RegExp(
      `<meta[^>]+content=[\\\"']([^\\\"']+)[\\\"'][^>]+(?:property|name)=[\\\"']${key}[\\\"'][^>]*>`,
      "i",
    );
    const m = html.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

function pickFirstLdJson(html: string) {
  const m = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m?.[1]) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

type HtmlResolved = { thumbnailUrl: string; title?: string; authorName?: string };

async function tryResolveViaHtml(pageUrl: string): Promise<HtmlResolved | null> {
  let res: Response;
  try {
    res = await fetchWithRetry(
      pageUrl,
      {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
      },
      redirect: "follow",
      cache: "no-store",
      },
      { tries: 2, timeoutMs: 7000 },
    );
  } catch {
    return null;
  }

  if (!res.ok) return null;
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.toLowerCase().includes("text/html")) return null;

  let html: string;
  try {
    html = await res.text();
  } catch {
    return null;
  }

  const thumbnail =
    pickFirstMetaContent(html, ["og:image", "twitter:image", "twitter:image:src"]) ?? null;

  const title =
    pickFirstMetaContent(html, ["og:title", "twitter:title"]) ??
    html.match(/<title[^>]*>([^<]{1,200})<\/title>/i)?.[1]?.trim() ??
    undefined;

  const ld = pickFirstLdJson(html);
  const ldThumb =
    typeof ld?.thumbnailUrl === "string"
      ? ld.thumbnailUrl
      : Array.isArray(ld?.thumbnailUrl) && typeof ld.thumbnailUrl[0] === "string"
        ? ld.thumbnailUrl[0]
        : undefined;

  const ldAuthor =
    typeof ld?.author?.name === "string"
      ? ld.author.name
      : Array.isArray(ld?.author) && typeof ld.author[0]?.name === "string"
        ? ld.author[0].name
        : undefined;

  const bestThumb = thumbnail ?? ldThumb ?? null;
  if (!bestThumb) return null;

  return { thumbnailUrl: bestThumb, title, authorName: ldAuthor };
}

type RequestBody = { url?: unknown };

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return toErr("请求体必须是 JSON。");
  }

  const requestBody = body as RequestBody;
  const url = typeof requestBody?.url === "string" ? requestBody.url.trim() : "";
  if (!url) return toErr("缺少 url 参数。");

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return toErr("url 不是有效链接。");
  }

  if (!/^https?:$/.test(parsed.protocol)) return toErr("仅支持 http/https 链接。");

  const cacheKey = `resolve:${parsed.toString()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    if ("ok" in cached && cached.ok) return NextResponse.json(cached as ResolveOk, { status: 200 });
    const c = cached as { ok: false; error: string; status: number };
    return toErr(c.error, c.status);
  }

  const { expandedUrl, expanded } = await expandTikTokUrl(parsed);
  const videoId = extractVideoId(expanded);
  const handle = extractHandle(expanded) ?? extractHandle(parsed);

  const oembedUrl = new URL("https://www.tiktok.com/oembed");
  oembedUrl.searchParams.set("url", expanded.toString());

  let upstreamRes: Response;
  try {
    upstreamRes = await fetchWithRetry(
      oembedUrl.toString(),
      {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; ThumbnailResolver/1.0)",
          accept: "application/json,text/plain,*/*",
        },
        cache: "no-store",
      },
      { tries: 2, timeoutMs: 6000 },
    );
  } catch {
    upstreamRes = new Response(null, { status: 0 });
  }

  type OembedData = {
    thumbnail_url?: unknown;
    thumbnail_url_with_play_button?: unknown;
    title?: unknown;
    author_name?: unknown;
    url?: unknown;
    provider_name?: unknown;
  };

  let data: OembedData | null = null;
  if (upstreamRes.ok) {
    try {
      data = (await upstreamRes.json()) as OembedData;
    } catch {
      data = null;
    }
  }

  const oembedThumbnailUrl =
    typeof data?.thumbnail_url === "string"
      ? data.thumbnail_url
      : typeof data?.thumbnail_url_with_play_button === "string"
        ? data.thumbnail_url_with_play_button
        : "";

  if (oembedThumbnailUrl) {
    const rawTitle = typeof data?.title === "string" ? data.title.trim() : "";
    const rawAuthor = typeof data?.author_name === "string" ? data.author_name.trim() : "";
    const authorFromOembed =
      rawAuthor && rawAuthor !== "." && rawAuthor.toLowerCase() !== "unknown" ? rawAuthor : "";

    const payload: ResolveOk = {
      ok: true,
      inputUrl: url,
      expandedUrl: expandedUrl !== url ? expandedUrl : undefined,
      canonicalUrl: typeof data?.url === "string" ? data.url : undefined,
      videoId,
      thumbnailUrl: oembedThumbnailUrl,
      title: rawTitle ? rawTitle : undefined,
      authorName: authorFromOembed ? authorFromOembed : handle ? `@${handle}` : undefined,
      providerName: typeof data?.provider_name === "string" ? data.provider_name : "TikTok",
    };
    setCached(cacheKey, payload);
    return NextResponse.json(payload, { status: 200 });
  }

  const htmlResolved = await tryResolveViaHtml(expanded.toString());
  if (htmlResolved?.thumbnailUrl) {
    const payload: ResolveOk = {
      ok: true,
      inputUrl: url,
      expandedUrl: expandedUrl !== url ? expandedUrl : undefined,
      canonicalUrl: undefined,
      videoId,
      thumbnailUrl: htmlResolved.thumbnailUrl,
      title: htmlResolved.title,
      authorName: htmlResolved.authorName ?? (handle ? `@${handle}` : undefined),
      providerName: "TikTok (HTML)",
    };
    setCached(cacheKey, payload);
    return NextResponse.json(payload, { status: 200 });
  }

  if (!upstreamRes.ok) {
    const err = { ok: false as const, error: `解析失败：oEmbed 返回错误（HTTP ${upstreamRes.status}）。`, status: 502 };
    setCached(cacheKey, err, 60 * 1000);
    return toErr(err.error, err.status);
  }
  const err = { ok: false as const, error: "解析失败：未从 oEmbed 或页面中获取到封面链接。", status: 502 };
  setCached(cacheKey, err, 60 * 1000);
  return toErr(err.error, err.status);
}

