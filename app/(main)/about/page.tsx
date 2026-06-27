import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">About</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">RS School</h2>
        <p className="text-muted-foreground">
          This project was created as part of the RS School course — a free, community-based
          JavaScript and Frontend education program.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Project</h2>
        <p className="text-muted-foreground">
          Swagger/OpenAPI editor and REST client for API exploration and testing. Built with
          Next.js, TypeScript, Tailwind CSS, and Supabase.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Our Team</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Aleksei</CardTitle>
              <CardDescription>Team Lead</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="https://github.com/maiano"
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                github.com/maiano
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Katya</CardTitle>
              <CardDescription>Developer</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="https://github.com/KatherinaSl"
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                github.com/KatherinaSl
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dilafruz</CardTitle>
              <CardDescription>Developer</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="https://github.com/Dilafruz-17"
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                github.com/Dilafruz-17
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
