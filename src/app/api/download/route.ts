import { NextResponse } from "next/server";

function isHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function pickExt(contentType: string | null) {
  if (!contentType) return "jpg";
  const ct = contentType.split(";")[0]?.trim().toLowerCase();
  if (ct === "image/png") return "png";
  if (ct === "image/webp") return "webp";
  if (ct === "image/gif") return "gif";
  if (ct === "image/jpeg" || ct === "image/jpg") return "jpg";
  return "jpg";
}

function sanitizeBaseName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "tiktok-thumbnail";
  // Remove path separators and reserved characters.
  const safe = trimmed.replace(/[\\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
  // Avoid extremely long filenames.
  return safe.slice(0, 80) || "tiktok-thumbnail";
}

function contentDisposition(filenameWithExt: string) {
  // Provide both ASCII fallback and RFC5987 UTF-8 filename* for better i18n support.
  const asciiFallback = filenameWithExt
    .normalize("NFKD")
    // Replace non-ascii with underscore instead of dropping (avoids trailing " - .jpg")
    .replace(/[^\x20-\x7E]+/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  const fallback = asciiFallback ? asciiFallback : "tiktok-thumbnail";
  const encoded = encodeURIComponent(filenameWithExt);
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = (searchParams.get("url") ?? "").trim();
  const name = (searchParams.get("name") ?? "").trim();

  if (!url) {
    return NextResponse.json({ ok: false, error: "缺少 url 参数。" }, { status: 400 });
  }
  if (!isHttpUrl(url)) {
    return NextResponse.json({ ok: false, error: "url 不是有效的 http/https 链接。" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; ThumbnailDownloader/1.0)",
        accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      redirect: "follow",
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "下载失败：无法请求图片源站。" }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { ok: false, error: `下载失败：源站返回 HTTP ${upstream.status}。` },
      { status: 502 },
    );
  }

  const contentType = upstream.headers.get("content-type");
  const ext = pickExt(contentType);
  const base = sanitizeBaseName(name);
  const filename = `${base}.${ext}`;

  const headers = new Headers();
  if (contentType) headers.set("content-type", contentType);
  headers.set("content-disposition", contentDisposition(filename));
  headers.set("cache-control", "no-store");

  return new NextResponse(upstream.body, { status: 200, headers });
}

