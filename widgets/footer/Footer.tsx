import Link from "next/link";
import { routes } from "@/shared/config/routes";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[--panel-border]">
      <div className="app-container flex justify-center px-4 py-6">
        <p className="text-muted-foreground text-sm">
          Swagger/OpenAPI Editor |{" "}
          <Link href={routes.about} className="hover:underline">
            About
          </Link>
        </p>
      </div>
    </footer>
  );
}
