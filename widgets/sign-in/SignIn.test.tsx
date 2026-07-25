import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignInComponent from "./SignIn";
import messages from "../../messages/en.json";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const signInWithPasswordMock = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("@/shared/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: signInWithPasswordMock,
    },
  }),
}));

describe("SignInComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders validation errors for invalid credentials", async () => {
    renderSignIn();

    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Enter a valid email address")).toBeTruthy();
    expect(screen.getByText("Password is required")).toBeTruthy();
    expect(signInWithPasswordMock).not.toHaveBeenCalled();
  });

  it("signs in and redirects on success", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null });
    renderSignIn();

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(signInWithPasswordMock).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "Password1!",
      });
    });
    expect(pushMock).toHaveBeenCalledWith("/");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("renders auth errors", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: new Error("Invalid login") });
    renderSignIn();

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Invalid login")).toBeTruthy();
  });
});

function renderSignIn() {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SignInComponent />
    </NextIntlClientProvider>
  );
}
