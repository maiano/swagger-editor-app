import net from "node:net";

import { isPrivateIp } from "./is-private-ip";
import { ProxyValidationError } from "./proxy-errors";
import { resolveTargetHost } from "./resolve-target-host";

const BLOCKED_HOSTNAMES = new Set(["localhost", "localhost.localdomain"]);

export async function validateTargetUrl(rawUrl: string): Promise<URL> {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new ProxyValidationError("Invalid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ProxyValidationError("Only HTTP and HTTPS protocols are allowed");
  }

  const hostname = normalizeHostname(url.hostname);

  if (isBlockedHostname(hostname)) {
    throw new ProxyValidationError("Target host is not allowed");
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new ProxyValidationError("Private network targets are not allowed");
    }

    return url;
  }

  const records = await resolveTargetHost(hostname);

  if (records.length === 0) {
    throw new ProxyValidationError("Target host cannot be resolved");
  }

  for (const record of records) {
    if (isPrivateIp(record.address)) {
      throw new ProxyValidationError("Resolved target IP is not allowed");
    }
  }

  return url;
}

function isBlockedHostname(hostname: string): boolean {
  return BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost");
}

function normalizeHostname(hostname: string): string {
  const normalizedHostname = hostname.toLowerCase();

  if (normalizedHostname.startsWith("[") && normalizedHostname.endsWith("]")) {
    return normalizedHostname.slice(1, -1);
  }

  return normalizedHostname;
}
