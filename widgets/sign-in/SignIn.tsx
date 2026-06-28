"use client";

import { createClient } from "@/shared/lib/supabase/client";
import { LoginData, LoginSchema } from "@/shared/schema/schema";
import { Button } from "@/shared/ui/button";
import { FieldLabel } from "@/shared/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/ui/input-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SignInComponent() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
  });
  const onSubmit = async (data: LoginData) => {
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      router.push("/");
    } catch (error: unknown) {
      console.error(error);
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm gap-6 rounded-lg border p-6 shadow-lg">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <h3>Sign In</h3>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <InputGroup>
            <InputGroupInput {...register("email")} type="email" placeholder="Enter your email" />
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
          </InputGroup>

          <FieldLabel htmlFor="password">Password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              {...register("password")}
              type="password"
              placeholder="Enter password"
            />
          </InputGroup>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit">Sign In</Button>
        </form>
      </div>
    </div>
  );
}
