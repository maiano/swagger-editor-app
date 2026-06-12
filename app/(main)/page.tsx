import { SwaggerEditor } from "@/widgets/swagger-editor";

export default function Home() {
  return (
    <main className="app-shell flex flex-1 px-4 py-6 md:px-6">
      <div className="app-container">
        <SwaggerEditor />
      </div>
    </main>
  );
}
