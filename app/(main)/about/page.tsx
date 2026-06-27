export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">About</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">RS School</h2>
        <p>
          This project was created as part of the RS School course — a free, community-based
          JavaScript and Frontend education program.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Project</h2>
        <p>
          Swagger/OpenAPI editor and REST client for API exploration and testing. Built with
          Next.js, TypeScript, Tailwind CSS, and Supabase.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Our Team</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-bold">Aleksei</h3>
            <p className="text-sm text-gray-500">Team Lead</p>
            <a href="https://github.com/maiano" target="_blank" className="text-blue-500">
              github.com/maiano
            </a>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-bold">Katya</h3>
            <p className="text-sm text-gray-500">Developer</p>
            <a href="https://github.com/KatherinaSl" target="_blank" className="text-blue-500">
              github.com/KatherinaSl
            </a>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-bold">Dilafruz</h3>
            <p className="text-sm text-gray-500">Developer</p>
            <a href="https://github.com/Dilafruz-17" target="_blank" className="text-blue-500">
              github.com/Dilafruz-17
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
