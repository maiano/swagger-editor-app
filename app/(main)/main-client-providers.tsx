"use client";

import type { ReactNode } from "react";

import { OpenApiWorkspaceProvider } from "@/features/openapi-workspace/model";

interface MainClientProvidersProps {
  children: ReactNode;
  initialSchemaText?: string;
  isAuthenticated: boolean;
}

export function MainClientProviders({
  children,
  initialSchemaText,
  isAuthenticated,
}: MainClientProvidersProps) {
  return (
    <OpenApiWorkspaceProvider
      initialSchemaText={initialSchemaText}
      isAuthenticated={isAuthenticated}
    >
      {children}
    </OpenApiWorkspaceProvider>
  );
}
