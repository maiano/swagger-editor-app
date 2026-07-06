import { RequestConsole } from "@/widgets/request-console";
import { SwaggerEditor } from "@/widgets/swagger-editor";
import { SwaggerViewer } from "@/widgets/swagger-viewer";

export function MainEditorScreen() {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
      <SwaggerEditor />
      <div className="grid gap-4">
        <section id="viewer" className="scroll-mt-24">
          <SwaggerViewer />
        </section>
        <RequestConsole />
      </div>
    </section>
  );
}
