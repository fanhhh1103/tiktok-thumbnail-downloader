import Link from "next/link";
import { locales, Locale, t } from "../../i18n";

function localeLabel(l: Locale) {
  if (l === "en") return "English";
  if (l === "zh") return "中文";
  if (l === "ja") return "日本語";
  return "Español";
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {t(locale, "aboutTitle")}
              </h1>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {t(locale, "aboutDescription")}
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

        <nav className="flex gap-4 text-sm">
          <Link href={`/${locale}`} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            {t(locale, "navHome")}
          </Link>
          <Link href={`/${locale}/contact`} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            {t(locale, "navContact")}
          </Link>
          <Link href={`/${locale}/privacy`} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            {t(locale, "navPrivacy")}
          </Link>
        </nav>

        <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950 sm:p-6">
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                ✓
              </span>
              <span>{t(locale, "aboutFeature1")}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                ✓
              </span>
              <span>{t(locale, "aboutFeature2")}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                ✓
              </span>
              <span>{t(locale, "aboutFeature3")}</span>
            </li>
          </ul>
        </section>

        <footer className="text-xs leading-5 text-zinc-500 dark:text-zinc-500">
          {t(locale, "footer")}
        </footer>
      </main>
    </div>
  );
}
