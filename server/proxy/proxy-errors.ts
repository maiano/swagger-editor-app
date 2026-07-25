export class ProxyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProxyValidationError";
  }
}
