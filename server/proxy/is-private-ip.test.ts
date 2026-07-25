import { describe, expect, it } from "vitest";

import { isPrivateIp } from "./is-private-ip";

describe("isPrivateIp", () => {
  it.each([
    "0.0.0.0",
    "10.0.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "::",
    "::1",
    "::ffff:127.0.0.1",
    "::ffff:7f00:1",
    "fc00::1",
    "fd00::1",
    "fe80::1",
  ])("blocks private or local address %s", (ip) => {
    expect(isPrivateIp(ip)).toBe(true);
  });

  it.each(["8.8.8.8", "1.1.1.1", "2001:4860:4860::8888"])("allows public address %s", (ip) => {
    expect(isPrivateIp(ip)).toBe(false);
  });
});
