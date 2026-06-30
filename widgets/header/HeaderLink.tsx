import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

const headerActionClassName =
  "hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 inline-flex h-7 cursor-pointer items-center justify-center rounded-md px-2.5 text-[0.8rem] font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-default disabled:opacity-50";

export function HeaderLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn(headerActionClassName, className)} {...props} />;
}

export function HeaderActionButton({ className, ...props }: ComponentProps<"button">) {
  return <button className={cn(headerActionClassName, className)} {...props} />;
}
