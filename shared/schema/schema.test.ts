import { describe, expect, it } from "vitest";

import { LoginSchema, RegistrationSchema } from "./schema";

describe("auth validation schemas", () => {
  it("accepts valid registration data", () => {
    const result = RegistrationSchema.safeParse({
      login: "alice",
      email: "alice@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
    });

    expect(result.success).toBe(true);
  });

  it("rejects registration data with translated validation keys", () => {
    const result = RegistrationSchema.safeParse({
      login: "",
      email: "not-an-email",
      password: "short",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        login: ["validation.loginRequired"],
        email: ["validation.invalidEmail"],
        password: ["validation.passwordMin", "validation.passwordComplexity"],
        confirmPassword: ["validation.passwordMismatch"],
      });
    }
  });

  it("validates login credentials", () => {
    expect(
      LoginSchema.safeParse({
        email: "user@example.com",
        password: "secret",
      }).success
    ).toBe(true);

    const result = LoginSchema.safeParse({
      email: "invalid",
      password: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        email: ["validation.invalidEmail"],
        password: ["validation.passwordRequired"],
      });
    }
  });
});
