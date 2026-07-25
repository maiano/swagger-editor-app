import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Locale } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LanguageSwitcher from "./LanguageSwitcher";

let locale = "en";

vi.mock("next-intl", () => ({
  useLocale: () => locale,
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    locale = "en";
  });

  it("disables the active locale and changes inactive locale", async () => {
    const changeLocaleAction = vi.fn<(_: Locale) => Promise<void>>().mockResolvedValue(undefined);

    render(<LanguageSwitcher changeLocaleAction={changeLocaleAction} />);

    expect(screen.getByRole("button", { name: "En" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ru" })).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "Ru" }));

    expect(changeLocaleAction).toHaveBeenCalledWith("ru");
  });
});
