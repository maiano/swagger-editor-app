import Link from "next/link";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export default function NotFound() {
  return (
    <main className="app-container flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="border-panel-border bg-panel text-panel-foreground w-full max-w-lg">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
          <CardDescription>
            The page you are looking for does not exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Open editor</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
