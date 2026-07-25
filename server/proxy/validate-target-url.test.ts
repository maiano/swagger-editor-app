import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProxyValidationError } from "./proxy-errors";
import { validateTargetUrl } from "./validate-target-url";

vi.mock("./resolve-target-host", () => ({
  resolveTargetHost: vi.fn(),
}));

const { resolveTargetHost } = await import("./resolve-target-host");
const resolveTargetHostMock = vi.mocked(resolveTargetHost);

describe("validateTargetUrl", () => {
  beforeEach(() => {
    resolveTargetHostMock.mockReset();
  });

  it("rejects invalid URLs", async () => {
    await expect(validateTargetUrl("not a url")).rejects.toThrow(ProxyValidationError);
  });

  it("rejects non-http protocols", async () => {
    await expect(validateTargetUrl("file:///etc/passwd")).rejects.toThrow(
      "Only HTTP and HTTPS protocols are allowed"
    );
  });

  it("rejects blocked hostnames", async () => {
    await expect(validateTargetUrl("http://localhost:3000")).rejects.toThrow(
      "Target host is not allowed"
    );
  });

  it("rejects direct private IP targets", async () => {
    await expect(validateTargetUrl("http://127.0.0.1:3000")).rejects.toThrow(
      "Private network targets are not allowed"
    );
  });

  it("rejects bracketed direct private IPv6 targets", async () => {
    await expect(validateTargetUrl("http://[::1]:3000")).rejects.toThrow(
      "Private network targets are not allowed"
    );
  });

  it("rejects direct IPv4-mapped IPv6 private targets", async () => {
    await expect(validateTargetUrl("http://[::ffff:127.0.0.1]:3000")).rejects.toThrow(
      "Private network targets are not allowed"
    );
  });

  it("rejects hostnames that resolve to private IPs", async () => {
    resolveTargetHostMock.mockResolvedValue([{ address: "10.0.0.1", family: 4 }]);

    await expect(validateTargetUrl("https://example.com")).rejects.toThrow(
      "Resolved target IP is not allowed"
    );
  });

  it("allows public http and https targets", async () => {
    resolveTargetHostMock.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);

    await expect(validateTargetUrl("https://example.com/api")).resolves.toMatchObject({
      href: "https://example.com/api",
    });
  });
});
