"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Locale, useLocale } from "next-intl";

export default function LanguageSwitcher({
  changeLocaleAction,
}: {
  changeLocaleAction: (locale: Locale) => Promise<void>;
}) {
  const locale = useLocale();

  return (
    <Select value={locale} onValueChange={(value) => changeLocaleAction(value as Locale)}>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue defaultValue={locale} />
      </SelectTrigger>
      <SelectContent>
        {["en", "ru"].map((cur) => (
          <SelectItem key={cur} value={cur}>
            {cur.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
