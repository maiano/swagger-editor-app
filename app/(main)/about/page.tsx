import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("AboutPage");
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">{t("pageTitle")}</h1>

      <section className="mb-10">
        <h2>{t("schoolTitle")}</h2>
        <p className="text-muted-foreground">{t("schoolDescription")}</p>
      </section>

      <section className="mb-10">
        <h2>{t("projectTitle")}</h2>
        <p className="text-muted-foreground">{t("projectDescription")}</p>
      </section>

      <section>
        <h2>{t("teamTitle")}</h2>
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
                className="text-blue-500 hover:underline"
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
                className="text-blue-500 hover:underline"
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
                className="text-blue-500 hover:underline"
              >
                github.com/Dilafruz-17
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
