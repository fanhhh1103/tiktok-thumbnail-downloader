import { isLocale } from "../../i18n";
import { notFound } from "next/navigation";
import Link from "next/link";
import { t, locales, type Locale } from "../../i18n";

function localeLabel(l: Locale) {
  if (l === "en") return "English";
  if (l === "zh") return "中文";
  if (l === "ja") return "日本語";
  return "Español";
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const sections = [
    { title: t(locale, "termsAcceptTitle"), body: t(locale, "termsAcceptDescription") },
    { title: t(locale, "termsUseTitle"), body: t(locale, "termsUseDescription") },
    { title: t(locale, "termsIpTitle"), body: t(locale, "termsIpDescription") },
    { title: t(locale, "termsDisclaimerTitle"), body: t(locale, "termsDisclaimerDescription") },
    { title: t(locale, "termsChangesTitle"), body: t(locale, "termsChangesDescription") },
    { title: t(locale, "termsContactTitle"), body: t(locale, "termsContactDescription") },
  ];

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        {/* Header */}
        <header className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <Link
                href={`/${locale}`}
                className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                ← {t(locale, "appTitle")}
              </Link>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {t(locale, "termsTitle")}
              </h1>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {t(locale, "termsDescription")}
              </p>
            </div>

            {/* Language switcher */}
            <div className="flex flex-wrap items-center gap-2">
              {locales.map((l) => (
                <Link
                  key={l}
                  href={`/${l}/terms`}
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

        {/* Sections */}
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950 sm:p-6"
            >
              <h2 className="mb-2 text-base font-semibold">{section.title}</h2>
              <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">{section.body}</p>
            </section>
          ))}
        </div>

        {/* Footer nav */}
        <footer className="border-t border-black/5 pt-6 dark:border-white/5">
          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href={`/${locale}`}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {t(locale, "appTitle")}
            </Link>
            <Link
              href={`/${locale}/privacy`}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {t(locale, "navPrivacy")}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {t(locale, "navAbout")}
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
