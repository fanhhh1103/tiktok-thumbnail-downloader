import { Locale, t } from "../../i18n";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold">{t(locale, "privacyTitle")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t(locale, "privacyDescription")}</p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t(locale, "privacyCollectTitle")}</h2>
          <p className="text-zinc-600 dark:text-zinc-400">{t(locale, "privacyCollectDescription")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t(locale, "privacyUseTitle")}</h2>
          <p className="text-zinc-600 dark:text-zinc-400">{t(locale, "privacyUseDescription")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t(locale, "privacyThirdTitle")}</h2>
          <p className="text-zinc-600 dark:text-zinc-400">{t(locale, "privacyThirdDescription")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t(locale, "privacyCookiesTitle")}</h2>
          <p className="text-zinc-600 dark:text-zinc-400">{t(locale, "privacyCookiesDescription")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t(locale, "privacyChangesTitle")}</h2>
          <p className="text-zinc-600 dark:text-zinc-400">{t(locale, "privacyChangesDescription")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t(locale, "privacyContactTitle")}</h2>
          <p className="text-zinc-600 dark:text-zinc-400">{t(locale, "privacyContactDescription")}</p>
        </section>
      </main>
    </div>
  );
}
