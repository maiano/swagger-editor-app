import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Header from "./Header";
import { getUser } from "@/shared/lib/supabase/utils";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";

const pushMock = vi.fn();
const changeLocaleAction = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/shared/lib/supabase/utils", () => ({
  getUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue(
    (key: string) =>
      ({
        header: "Swagger/OpenAPI UI",
        editor: "Editor",
        about: "About",
        history: "History",
        signIn: "Sign In",
        signUp: "Sign Up",
      })[key]
  ),
}));

describe("HeaderContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders app title", async () => {
    vi.mocked(getUser).mockResolvedValue(null);

    const Component = await Header({ changeLocaleAction });
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        {Component}
      </NextIntlClientProvider>
    );

    expect(screen.getByText("Swagger/OpenAPI UI")).toBeInTheDocument();
  });

  it("renders sign in and sign up buttons when user is not authenticated", async () => {
    vi.mocked(getUser).mockResolvedValue(null);

    const Component = await Header({ changeLocaleAction });
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        {Component}
      </NextIntlClientProvider>
    );

    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /history/i })).not.toBeInTheDocument();
  });

  it("renders history and logout when user is authenticated", async () => {
    vi.mocked(getUser).mockResolvedValue({
      id: "123",
      email: "test@example.com",
    } as never);

    const Component = await Header({ changeLocaleAction });

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        {Component}
      </NextIntlClientProvider>
    );

    expect(screen.getByRole("link", { name: /history/i })).toBeInTheDocument();
    expect(await screen.findByText(/logout/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /sign in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /sign up/i })).not.toBeInTheDocument();
  });
});
