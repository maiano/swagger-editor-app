import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LogoutButton } from "./LogoutButton";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import messages from "../../messages/en.json";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const signOutMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("@/shared/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signOut: signOutMock,
    },
  }),
}));

describe("LogoutButton", () => {
  it("logs user out and redirects", async () => {
    signOutMock.mockResolvedValue(undefined);

    renderLogoutButton();

    await userEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(signOutMock).toHaveBeenCalled();
  });

  it("redirects after logout", async () => {
    signOutMock.mockResolvedValue(undefined);

    renderLogoutButton();

    await userEvent.click(screen.getByRole("button", { name: /logout/i }));

    await vi.waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});

function renderLogoutButton() {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <LogoutButton />
    </NextIntlClientProvider>
  );
}
