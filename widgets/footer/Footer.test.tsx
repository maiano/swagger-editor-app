import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Footer } from "./Footer";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async (namespace: string) => {
    const messages: Record<string, Record<string, string>> = {
      Common: {
        appName: "Swagger/OpenAPI UI",
      },
      Footer: {
        about: "About",
      },
    };

    return (key: string) => messages[namespace]?.[key] ?? key;
  }),
}));

describe("Footer", () => {
  it("renders app name and about link", async () => {
    const Component = await Footer();

    render(Component);

    expect(screen.getByText("Swagger/OpenAPI UI")).toBeTruthy();
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });
});
