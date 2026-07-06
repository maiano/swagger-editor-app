"use client";

import Link from "next/link";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="app-container flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="border-panel-border bg-panel text-panel-foreground w-full max-w-lg">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            The app could not complete this action. You can try again or return to the editor.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error.digest ? (
            <p className="text-muted-foreground font-mono text-xs">Error code: {error.digest}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={reset}>
              Try again
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href="/">Open editor</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
