import { OpenApiWorkspaceProvider } from "@/features/openapi-workspace/model";
import { SwaggerEditor } from "@/widgets/swagger-editor";

export function MainEditorScreen() {
  return (
    <OpenApiWorkspaceProvider>
      <section className="grid gap-4">
        <SwaggerEditor />
      </section>
    </OpenApiWorkspaceProvider>
  );
}
