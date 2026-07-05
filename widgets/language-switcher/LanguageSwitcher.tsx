"use client";

import { Locale, useLocale } from "next-intl";
import { useTransition } from "react";

const locales = ["en", "ru"] as const;

export default function LanguageSwitcher({
  changeLocaleAction,
}: {
  changeLocaleAction: (locale: Locale) => Promise<void>;
}) {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  function setLocale(nextLocale: Locale) {
    startTransition(() => {
      void changeLocaleAction(nextLocale);
    });
  }

  return (
    <div className="text-muted-foreground flex items-center gap-1 pl-2 text-sm">
      {locales.map((nextLocale, index) => {
        const isActive = nextLocale === locale;

        return (
          <span key={nextLocale} className="inline-flex items-center gap-1">
            {index > 0 ? <span aria-hidden="true">|</span> : null}
            <button
              type="button"
              disabled={isPending || isActive}
              aria-pressed={isActive}
              data-active={isActive}
              onClick={() => setLocale(nextLocale)}
              className="hover:text-foreground data-[active=true]:text-foreground cursor-pointer transition-colors disabled:pointer-events-none disabled:opacity-50 data-[active=true]:cursor-default data-[active=true]:disabled:opacity-100"
            >
              {formatLocaleLabel(nextLocale)}
            </button>
          </span>
        );
      })}
    </div>
  );
}

function formatLocaleLabel(locale: Locale) {
  return `${locale[0]?.toUpperCase()}${locale.slice(1)}`;
}
