"use client";

import { createClient } from "@/shared/lib/supabase/client";
import { LoginData, LoginSchema } from "@/shared/schema/schema";
import { Button } from "@/shared/ui/button";
import { FieldError, FieldLabel } from "@/shared/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/ui/input-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, MailIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function SignInComponent() {
  const t = useTranslations("ValidationForms");
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
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
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t("errorGeneric"));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm gap-6 rounded-lg border p-6 shadow-lg">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground absolute top-4 left-4 flex items-center gap-1 text-sm"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t("back")}
        </Link>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <h3>{t("signIn.title")}</h3>
          <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
          <InputGroup>
            <InputGroupInput
              {...register("email")}
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
            />
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
          </InputGroup>
          {errors.email?.message && <FieldError>{t(errors.email.message)}</FieldError>}

          <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
          <InputGroup>
            <InputGroupInput
              {...register("password")}
              id="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
            />
          </InputGroup>
          {errors.password?.message && <FieldError>{t(errors.password.message)}</FieldError>}

          <Button type="submit">{t("signIn.submit")}</Button>
          {error && <FieldError>{error}</FieldError>}
        </form>
      </div>
    </div>
  );
}
