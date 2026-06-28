import { MainEditorScreen } from "@/widgets/main-editor-screen";

export default async function Home() {
  return (
    <main className="app-shell flex flex-1 px-4 py-6 md:px-6">
      <div className="app-container">
        <MainEditorScreen />
      </div>
    </main>
  );
}
