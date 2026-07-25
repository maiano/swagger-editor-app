import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

const technologies = ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Vitest", "shadcn/ui"];

const teamMembers = [
  {
    name: "Aleksei",
    roleKey: "teamLead",
    githubUrl: "https://github.com/maiano",
    githubLabel: "github.com/maiano",
  },
  {
    name: "Katya",
    roleKey: "developer",
    githubUrl: "https://github.com/KatherinaSl",
    githubLabel: "github.com/KatherinaSl",
  },
  {
    name: "Dilafruz",
    roleKey: "developer",
    githubUrl: "https://github.com/Dilafruz-17",
    githubLabel: "github.com/Dilafruz-17",
  },
] as const;

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
          {teamMembers.map((member) => (
            <Card key={member.githubUrl}>
              <CardHeader>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription>{t(member.roleKey)}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={member.githubUrl}
                  target="_blank"
                  className="text-primary text-sm hover:underline"
                >
                  {member.githubLabel}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </section>
  );
}
