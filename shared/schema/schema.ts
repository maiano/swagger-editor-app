import * as z from "zod";

export const RegistrationSchema = z
  .object({
    login: z.string().nonempty("Login is required"),
    email: z.email("Email is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W])/,
        "Password must contain at least one letter, one digit, and one special character"
      ),
    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export const LoginSchema = z.object({
  email: z.email("Email is required"),
  password: z.string().nonempty("Password is required"),
});

export type RegistrationData = z.infer<typeof RegistrationSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
