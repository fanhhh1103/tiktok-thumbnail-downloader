export const locales = ["en", "zh", "ja", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

const dict = {
  en: {
    appTitle: "TikTok Thumbnail Downloader",
    appSubtitle:
      "Paste a TikTok video link, resolve the thumbnail, then download it. (oEmbed first, HTML fallback)",
    inputLabel: "TikTok URL",
    inputPlaceholder: "e.g. https://www.tiktok.com/@.../video/...",
    resolveBtn: "Resolve thumbnail",
    resolving: "Resolving…",
    invalidUrl: "Please enter a valid TikTok URL.",
    parseFailed: "Resolve failed. Please try again later.",
    networkError: "Network error. Please try again later.",
    source: "Source",
    expanded: "Expanded URL",
    titleFallback: "(No title)",
    author: "Author",
    download: "Download",
    openOriginal: "Open original",
    footer:
      "Tip: If oEmbed is blocked, the app will try an HTML meta/ld+json fallback automatically.",
  },
  zh: {
    appTitle: "TikTok 视频封面下载器",
    appSubtitle: "粘贴 TikTok 视频链接，解析封面并下载。（优先 oEmbed，失败自动兜底）",
    inputLabel: "TikTok 链接",
    inputPlaceholder: "例如：https://www.tiktok.com/@.../video/...",
    resolveBtn: "解析封面",
    resolving: "解析中…",
    invalidUrl: "请输入一个有效的 TikTok 链接。",
    parseFailed: "解析失败，请稍后再试。",
    networkError: "网络异常，请稍后再试。",
    source: "来源",
    expanded: "已展开短链",
    titleFallback: "（无标题）",
    author: "作者",
    download: "下载封面",
    openOriginal: "打开原图",
    footer: "提示：若 oEmbed 受限，会自动尝试 HTML meta/ld+json 兜底解析。",
  },
  ja: {
    appTitle: "TikTok サムネイルダウンローダー",
    appSubtitle:
      "TikTok の動画リンクを貼り付けてサムネイルを解析し、ダウンロードします。（oEmbed 優先、失敗時は HTML でフォールバック）",
    inputLabel: "TikTok URL",
    inputPlaceholder: "例：https://www.tiktok.com/@.../video/...",
    resolveBtn: "解析する",
    resolving: "解析中…",
    invalidUrl: "有効な TikTok URL を入力してください。",
    parseFailed: "解析に失敗しました。しばらくしてから再試行してください。",
    networkError: "ネットワークエラーです。しばらくしてから再試行してください。",
    source: "ソース",
    expanded: "展開後のURL",
    titleFallback: "（タイトルなし）",
    author: "作者",
    download: "ダウンロード",
    openOriginal: "元画像を開く",
    footer:
      "ヒント：oEmbed がブロックされた場合、自動的に HTML meta/ld+json でフォールバックします。",
  },
  es: {
    appTitle: "Descargador de miniaturas de TikTok",
    appSubtitle:
      "Pega un enlace de TikTok, resuelve la miniatura y descárgala. (oEmbed primero, HTML como respaldo)",
    inputLabel: "URL de TikTok",
    inputPlaceholder: "p. ej. https://www.tiktok.com/@.../video/...",
    resolveBtn: "Resolver miniatura",
    resolving: "Resolviendo…",
    invalidUrl: "Introduce una URL válida de TikTok.",
    parseFailed: "No se pudo resolver. Inténtalo de nuevo más tarde.",
    networkError: "Error de red. Inténtalo de nuevo más tarde.",
    source: "Fuente",
    expanded: "URL expandida",
    titleFallback: "(Sin título)",
    author: "Autor",
    download: "Descargar",
    openOriginal: "Abrir original",
    footer:
      "Consejo: si oEmbed está bloqueado, la app intentará un respaldo HTML meta/ld+json automáticamente.",
  },
} satisfies Record<Locale, Record<string, string>>;

export function t(locale: Locale, key: keyof (typeof dict)["en"]) {
  return dict[locale][key] ?? dict.en[key];
}

