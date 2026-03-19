import { isLocale } from "../i18n";
import { notFound } from "next/navigation";
import LocaleHomeClient from "./ui";

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LocaleHomeClient locale={locale} />;
}

