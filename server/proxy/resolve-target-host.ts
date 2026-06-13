import dns from "node:dns/promises";

export async function resolveTargetHost(hostname: string) {
  return dns.lookup(hostname, {
    all: true,
    verbatim: true,
  });
}
