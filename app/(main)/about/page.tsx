import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

const technologies = ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Vitest", "shadcn/ui"];

export default async function AboutPage() {
  const t = await getTranslations("AboutPage");

  return (
    <section className="grid gap-12 py-8">
      <div className="max-w-2xl">
        <h1 className="mb-4 text-4xl font-bold">{t("pageTitle")}</h1>
        <p className="text-muted-foreground text-lg">{t("projectDescription")}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="app-panel p-8">
          <h2 className="mb-4">{t("schoolTitle")}</h2>
          <p className="text-muted-foreground">{t("schoolDescription")}</p>
        </section>

        <section className="app-panel p-8">
          <h2 className="mb-4">{t("technologiesTitle")}</h2>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="bg-muted text-muted-foreground rounded-md px-3 py-1 text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-8">{t("teamTitle")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Aleksei</CardTitle>
              <CardDescription>{t("teamLead")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="https://github.com/maiano"
                target="_blank"
                className="text-primary text-sm hover:underline"
              >
                github.com/maiano
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Katya</CardTitle>
              <CardDescription>{t("developer")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="https://github.com/KatherinaSl"
                target="_blank"
                className="text-primary text-sm hover:underline"
              >
                github.com/KatherinaSl
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dilafruz</CardTitle>
              <CardDescription>{t("developer")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="https://github.com/Dilafruz-17"
                target="_blank"
                className="text-primary text-sm hover:underline"
              >
                github.com/Dilafruz-17
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </section>
  );
}
