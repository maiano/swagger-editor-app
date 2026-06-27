export default function AboutPage() {
  return (
    <main style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>About</h1>

      <section>
        <h2>RS School</h2>
        <p>
          This project was created as part of the RS School course — a free, community-based
          JavaScript/Frontend education program.
        </p>
      </section>

      <section>
        <h2>Project</h2>
        <p>Swagger/OpenAPI editor and REST client for API exploration and testing.</p>
        <p>Technologies: Next.js, React, TypeScript, Firebase</p>
      </section>

      <section>
        <h2>Our Team</h2>
        <ul>
          <li>
            <a href="https://github.com/maiano" target="_blank">
              Aleksei
            </a>{" "}
            — Team Lead
          </li>
          <li>
            <a href="https://github.com/KatherinaSl" target="_blank">
              Katya
            </a>{" "}
            — Developer
          </li>
          <li>
            <a href="https://github.com/Dilafruz-17" target="_blank">
              Dilafruz
            </a>{" "}
            — Developer
          </li>
        </ul>
      </section>
    </main>
  );
}
