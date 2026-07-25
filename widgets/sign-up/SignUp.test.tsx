import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignUpComponent from "./SignUp";
import messages from "../../messages/en.json";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const signUpMock = vi.fn();

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
      signUp: signUpMock,
    },
  }),
}));

describe("SignUpComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates password confirmation before submit", async () => {
    renderSignUp();

    await userEvent.type(screen.getByLabelText("Login"), "alice");
    await userEvent.type(screen.getByLabelText("Email"), "alice@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "Password1!");
    await userEvent.type(screen.getByLabelText("Confirm password"), "Password2!");
    await userEvent.tab();

    expect(await screen.findByText("Passwords do not match")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeDisabled();
  });

  it("signs up and redirects on success", async () => {
    signUpMock.mockResolvedValue({ error: null });
    renderSignUp();

    await fillValidSignUpForm();
    await waitFor(() => expect(screen.getByRole("button", { name: "Sign up" })).toBeEnabled());
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith({
        email: "alice@example.com",
        password: "Password1!",
        options: {
          data: {
            display_name: "alice",
          },
        },
      });
    });
    expect(pushMock).toHaveBeenCalledWith("/");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("renders signup errors", async () => {
    signUpMock.mockResolvedValue({ error: new Error("Email already registered") });
    renderSignUp();

    await fillValidSignUpForm();
    await waitFor(() => expect(screen.getByRole("button", { name: "Sign up" })).toBeEnabled());
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(await screen.findByText("Email already registered")).toBeTruthy();
  });
});

async function fillValidSignUpForm() {
  await userEvent.type(screen.getByLabelText("Login"), "alice");
  await userEvent.type(screen.getByLabelText("Email"), "alice@example.com");
  await userEvent.type(screen.getByLabelText("Password"), "Password1!");
  await userEvent.type(screen.getByLabelText("Confirm password"), "Password1!");
  await userEvent.tab();
}

function renderSignUp() {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SignUpComponent />
    </NextIntlClientProvider>
  );
}
