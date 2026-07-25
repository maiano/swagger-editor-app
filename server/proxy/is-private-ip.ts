import net from "node:net";

function ipv4ToNumber(ip: string): number | null {
  const parts = ip.split(".");

  if (parts.length !== 4) {
    return null;
  }

  const numbers = parts.map((part) => Number(part));

  if (numbers.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return null;
  }

  return numbers.reduce((value, part) => (value << 8) + part, 0) >>> 0;
}

function isIpv4InRange(ip: string, base: string, maskBits: number): boolean {
  const ipNumber = ipv4ToNumber(ip);
  const baseNumber = ipv4ToNumber(base);

  if (ipNumber === null || baseNumber === null) {
    return false;
  }

  const mask = maskBits === 0 ? 0 : (0xffffffff << (32 - maskBits)) >>> 0;

  return (ipNumber & mask) === (baseNumber & mask);
}

function normalizeIpv6(ip: string): string {
  return ip.toLowerCase();
}

function getMappedIpv4FromIpv6(ip: string): string | null {
  const normalizedIp = normalizeIpv6(ip);

  if (!normalizedIp.startsWith("::ffff:")) {
    return null;
  }

  const suffix = normalizedIp.slice("::ffff:".length);

  if (net.isIP(suffix) === 4) {
    return suffix;
  }

  const parts = suffix.split(":");

  if (parts.length !== 2) {
    return null;
  }

  const [highPart, lowPart] = parts as [string, string];
  const high = Number.parseInt(highPart, 16);
  const low = Number.parseInt(lowPart, 16);

  if (
    !Number.isInteger(high) ||
    !Number.isInteger(low) ||
    high < 0 ||
    low < 0 ||
    high > 0xffff ||
    low > 0xffff
  ) {
    return null;
  }

  return `${high >> 8}.${high & 0xff}.${low >> 8}.${low & 0xff}`;
}

export function isPrivateIp(ip: string): boolean {
  const version = net.isIP(ip);

  if (version === 4) {
    return (
      isIpv4InRange(ip, "0.0.0.0", 8) ||
      isIpv4InRange(ip, "10.0.0.0", 8) ||
      isIpv4InRange(ip, "127.0.0.0", 8) ||
      isIpv4InRange(ip, "169.254.0.0", 16) ||
      isIpv4InRange(ip, "172.16.0.0", 12) ||
      isIpv4InRange(ip, "192.168.0.0", 16)
    );
  }

  if (version === 6) {
    const normalizedIp = normalizeIpv6(ip);
    const mappedIpv4 = getMappedIpv4FromIpv6(normalizedIp);

    if (mappedIpv4 !== null) {
      return isPrivateIp(mappedIpv4);
    }

    return (
      normalizedIp === "::" ||
      normalizedIp === "::1" ||
      normalizedIp.startsWith("fc") ||
      normalizedIp.startsWith("fd") ||
      normalizedIp.startsWith("fe8") ||
      normalizedIp.startsWith("fe9") ||
      normalizedIp.startsWith("fea") ||
      normalizedIp.startsWith("feb")
    );
  }

  return true;
}
