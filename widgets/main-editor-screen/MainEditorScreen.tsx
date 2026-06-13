import { OpenApiWorkspaceProvider } from "@/features/openapi-workspace/model";
import { RequestConsole } from "@/widgets/request-console";
import { SwaggerEditor } from "@/widgets/swagger-editor";
import { SwaggerViewer } from "@/widgets/swagger-viewer";

export function MainEditorScreen() {
  return (
    <OpenApiWorkspaceProvider>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <SwaggerEditor />
        <div className="grid gap-4">
          <SwaggerViewer />
          <RequestConsole />
        </div>
      </section>
    </OpenApiWorkspaceProvider>
  );
}
