import Link from "next/link";
import { getTranslations } from "next-intl/server";
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
  const { userName, history } = await getHistoryPageData(searchParams);
  const t = await getTranslations("HistoryPage");

  return (
    <section className="grid gap-4">
      <header className="grid gap-1">
        <h3 className="font-semibold tracking-tight">{t("title")}</h3>
        <p className="text-muted-foreground text-sm">
          {t("description", {
            userName,
          })}
        </p>
      </header>

      {history.rows.length === 0 ? (
        <Card className="border-panel-border bg-panel text-panel-foreground">
          <CardHeader>
            <CardTitle>{t("emptyTitle")}</CardTitle>
            <CardDescription>{t("emptyDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={routes.home}>{t("openEditor")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-panel-border bg-panel text-panel-foreground">
          <CardHeader>
            <CardTitle>{t("requestsTitle")}</CardTitle>
            <CardDescription>
              {t("recordedRequests", {
                count: history.pagination.total,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 overflow-x-auto">
            <table className="w-full min-w-190 text-sm">
              <thead className="text-muted-foreground border-border border-b text-left text-xs">
                <tr>
                  <th className="py-2 pr-3 font-medium">{t("columns.time")}</th>
                  <th className="py-2 pr-3 font-medium">{t("columns.method")}</th>
                  <th className="py-2 pr-3 font-medium">{t("columns.endpoint")}</th>
                  <th className="py-2 pr-3 font-medium">{t("columns.status")}</th>
                  <th className="py-2 pr-3 font-medium">{t("columns.duration")}</th>
                  <th className="py-2 pr-3 font-medium">{t("columns.size")}</th>
                  <th className="py-2 font-medium">{t("columns.error")}</th>
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
                      <StatusBadge statusCode={row.statusCode} failedLabel={t("failed")} />
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
                        <span className="text-muted-foreground">{t("none")}</span>
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
                label={t("previousPage")}
              >
                {t("previous")}
              </PaginationButton>
              <span className="text-muted-foreground text-xs">
                {t("pageIndicator", {
                  page: history.pagination.page,
                  totalPages: Math.max(history.pagination.totalPages, 1),
                })}
              </span>
              <PaginationButton
                disabled={!history.pagination.hasNextPage}
                href={`${routes.history}?page=${history.pagination.page + 1}`}
                label={t("nextPage")}
              >
                {t("next")}
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
    userName: getUserDisplayName(user),
    history,
  };
}

function getUserDisplayName(user: NonNullable<Awaited<ReturnType<typeof getUser>>>) {
  const displayName = user.user_metadata.display_name;

  return typeof displayName === "string" && displayName.trim().length > 0
    ? displayName
    : (user.email ?? "authenticated user");
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
