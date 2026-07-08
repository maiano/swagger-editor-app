import { z } from "zod";

const httpMethodSchema = z.enum(["get", "post", "put", "patch", "delete", "options", "head"]);
const stringRecordSchema = z.record(z.string(), z.string());

export const proxyInputSchema = z.object({
  endpointId: z.string().min(1),
  method: httpMethodSchema,
  path: z.string().min(1),
  resolvedUrl: z.string().min(1),
  headers: stringRecordSchema.default({}),
  query: stringRecordSchema.default({}),
  pathParams: stringRecordSchema.default({}),
  cookies: stringRecordSchema.default({}),
  requestContentType: z.string().optional(),
  responseContentType: z.string().optional(),
  body: z.unknown().optional(),
});

export type ProxyInput = z.infer<typeof proxyInputSchema>;
