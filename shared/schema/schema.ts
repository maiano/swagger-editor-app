import * as z from "zod";

export const RegistrationSchema = z
  .object({
    login: z.string().nonempty({
      message: "validation.loginRequired",
    }),

    email: z.email({
      message: "validation.invalidEmail",
    }),

    password: z
      .string()
      .min(8, {
        message: "validation.passwordMin",
      })
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W])/, {
        message: "validation.passwordComplexity",
      }),

    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "validation.passwordMismatch",
      });
    }
  });

export const LoginSchema = z.object({
  email: z.email({
    message: "validation.invalidEmail",
  }),

  password: z.string().nonempty({
    message: "validation.passwordRequired",
  }),
});

export type RegistrationData = z.infer<typeof RegistrationSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
