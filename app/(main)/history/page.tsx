import Link from "next/link";
import { redirect } from "next/navigation";

import { loadRequestHistoryPage } from "@/server/analytics/load-request-history-page";
import { routes } from "@/shared/config/routes";
import { getUser } from "@/shared/lib/supabase/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

interface HistoryPageProps {
  searchParams?: Promise<{
    page?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const { userEmail, history } = await getHistoryPageData(searchParams);

  return (
    <section className="grid gap-4">
      <header className="grid gap-1">
        <h3 className="font-semibold tracking-tight">Request History</h3>
        <p className="text-muted-foreground text-sm">
          Server-rendered request history for {userEmail}.
        </p>
      </header>

      {history.rows.length === 0 ? (
        <Card className="border-panel-border bg-panel text-panel-foreground">
          <CardHeader>
            <CardTitle>No requests yet</CardTitle>
            <CardDescription>
              Execute a request from the editor to see it appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={routes.home}>Open editor</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-panel-border bg-panel text-panel-foreground">
          <CardHeader>
            <CardTitle>Requests</CardTitle>
            <CardDescription>
              {history.pagination.total.toLocaleString()} recorded requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 overflow-x-auto">
            <table className="w-full min-w-190 text-sm">
              <thead className="text-muted-foreground border-border border-b text-left text-xs">
                <tr>
                  <th className="py-2 pr-3 font-medium">Time</th>
                  <th className="py-2 pr-3 font-medium">Method</th>
                  <th className="py-2 pr-3 font-medium">Endpoint</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Duration</th>
                  <th className="py-2 pr-3 font-medium">Size</th>
                  <th className="py-2 font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {history.rows.map((row) => (
                  <tr key={row.id} className="border-border border-b last:border-b-0">
                    <td className="py-3 pr-3 font-mono text-xs">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`method-badge method-badge--${row.method.toLowerCase()}`}>
                        {row.method}
                      </span>
                    </td>
                    <td className="max-w-70 py-3 pr-3">
                      <div className="truncate font-mono text-xs">{row.path}</div>
                      <div className="text-muted-foreground truncate text-xs">
                        {row.resolvedUrl}
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <StatusBadge statusCode={row.statusCode} failedLabel="Failed" />
                    </td>
                    <td className="py-3 pr-3 font-mono text-xs">{row.durationMs} ms</td>
                    <td className="py-3 pr-3 font-mono text-xs">
                      {row.requestSizeBytes.toLocaleString()} /{" "}
                      {row.responseSizeBytes.toLocaleString()} B
                    </td>
                    <td className="max-w-55 py-3 text-xs">
                      {row.errorDetails ? (
                        <span className="text-status-error line-clamp-2">{row.errorDetails}</span>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between gap-3">
              <PaginationButton
                disabled={!history.pagination.hasPreviousPage}
                href={`${routes.history}?page=${history.pagination.page - 1}`}
                label="Previous page"
              >
                Previous
              </PaginationButton>
              <span className="text-muted-foreground text-xs">
                Page {history.pagination.page} of {Math.max(history.pagination.totalPages, 1)}
              </span>
              <PaginationButton
                disabled={!history.pagination.hasNextPage}
                href={`${routes.history}?page=${history.pagination.page + 1}`}
                label="Next page"
              >
                Next
              </PaginationButton>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

async function getHistoryPageData(searchParams: HistoryPageProps["searchParams"]) {
  const user = await getUser();

  if (!user) {
    redirect(routes.home);
  }

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page ?? 1);
  const history = await loadRequestHistoryPage(user.id, {
    page: Number.isInteger(page) ? page : 1,
  });

  if (
    history.pagination.totalPages > 0 &&
    history.pagination.page > history.pagination.totalPages
  ) {
    redirect(`${routes.history}?page=${history.pagination.totalPages}`);
  }

  return {
    userEmail: user.email ?? "authenticated user",
    history,
  };
}

function StatusBadge({
  failedLabel,
  statusCode,
}: {
  failedLabel: string;
  statusCode: number | null;
}) {
  if (statusCode === null) {
    return <Badge variant="outline">{failedLabel}</Badge>;
  }

  const tone = statusCode >= 400 ? "text-status-error" : "text-status-success";

  return (
    <Badge variant="outline" className={tone}>
      {statusCode}
    </Badge>
  );
}

function PaginationButton({
  children,
  disabled,
  href,
  label,
}: {
  children: React.ReactNode;
  disabled: boolean;
  href: string;
  label: string;
}) {
  if (disabled) {
    return (
      <Button type="button" variant="outline" size="sm" disabled aria-label={label}>
        {children}
      </Button>
    );
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link href={href} aria-label={label}>
        {children}
      </Link>
    </Button>
  );
}
