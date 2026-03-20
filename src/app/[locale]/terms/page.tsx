import { Locale, t } from "../../i18n";

export default async function TermsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold">{t(locale, "termsTitle")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t(locale, "termsDescription")}</p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t(locale, "termsAcceptTitle")}</h2>
          <p className="text-zinc-600 dark:text-zinc-400">{t(locale, "termsAcceptDescription")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t(locale, "termsIpTitle")}</h2>
          <p className="text-zinc-600 dark:text-zinc-400">{t(locale, "termsIpDescription")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t(locale, "termsDisclaimerTitle")}</h2>
          <p className="text-zinc-600 dark:text-zinc-400">{t(locale, "termsDisclaimerDescription")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t(locale, "termsChangesTitle")}</h2>
          <p className="text-zinc-600 dark:text-zinc-400">{t(locale, "termsChangesDescription")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t(locale, "termsContactTitle")}</h2>
          <p className="text-zinc-600 dark:text-zinc-400">{t(locale, "termsContactDescription")}</p>
        </section>
      </main>
    </div>
  );
}
