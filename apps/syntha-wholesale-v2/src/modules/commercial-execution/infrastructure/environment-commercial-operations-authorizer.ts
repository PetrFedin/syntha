import { timingSafeEqual } from "node:crypto";

import type { CommercialOperationsAuthorizer } from "../application/commercial-operations-authorizer";

function equal(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export class EnvironmentCommercialOperationsAuthorizer
  implements CommercialOperationsAuthorizer
{
  private readonly token: string;

  constructor(
    environment: Readonly<Record<string, string | undefined>> = process.env,
  ) {
    const token = environment.SYNTHA_OPERATIONS_API_TOKEN;
    if (!token || token.length < 24) {
      throw new Error(
        "SYNTHA_OPERATIONS_API_TOKEN must contain at least 24 characters.",
      );
    }
    this.token = token;
  }

  async authorize(request: Request): Promise<boolean> {
    const authorization = request.headers.get("authorization") ?? "";
    if (!authorization.startsWith("Bearer ")) return false;
    return equal(authorization.slice(7), this.token);
  }
}
