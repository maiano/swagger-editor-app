"use client";

import type { ReactNode } from "react";

import { OpenApiWorkspaceProvider } from "@/features/openapi-workspace/model";

interface MainClientProvidersProps {
  children: ReactNode;
  initialSchemaText?: string;
}

export function MainClientProviders({ children, initialSchemaText }: MainClientProvidersProps) {
  return (
    <OpenApiWorkspaceProvider initialSchemaText={initialSchemaText}>
      {children}
    </OpenApiWorkspaceProvider>
  );
}
