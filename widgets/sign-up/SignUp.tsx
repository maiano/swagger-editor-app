"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegistrationData, RegistrationSchema } from "@/shared/schema/schema";
import { createClient } from "@/shared/lib/supabase/client";
import { FieldError, FieldLabel } from "@/shared/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/ui/input-group";
import { Button } from "@/shared/ui/button";
import { MailIcon } from "lucide-react";

export default function SignUpComponent() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegistrationData>({
    resolver: zodResolver(RegistrationSchema),
    mode: "onTouched",
  });
  const onSubmit = async (data: RegistrationData) => {
    setError(null);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.login,
          },
        },
      });
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm gap-6 rounded-lg border p-6 shadow-lg">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <h3>Sign Up</h3>
          <FieldLabel htmlFor="login">Login</FieldLabel>
          <InputGroup>
            <InputGroupInput
              {...register("login")}
              id="login"
              type="text"
              placeholder="Enter your login"
            />
          </InputGroup>
          {errors.login?.message && <FieldError>{errors.login.message}</FieldError>}

          <FieldLabel htmlFor="email">Email</FieldLabel>
          <InputGroup>
            <InputGroupInput
              {...register("email")}
              id="email"
              type="email"
              placeholder="Enter your email"
            />
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
          </InputGroup>
          {errors.email?.message && <FieldError>{errors.email.message}</FieldError>}

          <FieldLabel htmlFor="password">Password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              {...register("password")}
              id="password"
              type="password"
              placeholder="Enter password"
            />
          </InputGroup>
          {errors.password?.message && <FieldError>{errors.password.message}</FieldError>}

          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              {...register("confirmPassword")}
              id="confirmPassword"
              type="password"
              placeholder="Please, confirm password"
            />
          </InputGroup>
          {errors.confirmPassword?.message && (
            <FieldError>{errors.confirmPassword.message}</FieldError>
          )}

          <Button disabled={!isValid} type="submit">
            Sign up
          </Button>
          {error && <FieldError>{error}</FieldError>}
        </form>
      </div>
    </div>
  );
}
