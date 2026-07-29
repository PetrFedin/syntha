import { NextResponse } from "next/server";

import {
  getCommercialExecutionRuntime,
  HmacIntegrationCallbackVerifier,
  normalizeCommercialOrganizationId,
  parseIntegrationCallbackRequest,
  scopeCommercialWorkflowRepository,
  verifyAndReconcileIntegrationCallback,
} from "@/modules/commercial-execution";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: {
    readonly params: Promise<{
      readonly workflowId: string;
      readonly integrationId: string;
    }>;
  },
) {
  let commercialRuntime;
  try {
    commercialRuntime = await getCommercialExecutionRuntime();
  } catch {
    return NextResponse.json(
      { error: "commercial_execution_runtime_unavailable" },
      { status: 503 },
    );
  }

  const receivedAt = new Date().toISOString();
  const rawBody = await request.text();
  const { workflowId, integrationId } = await context.params;
  try {
    const parsed = parseIntegrationCallbackRequest({
      integrationId,
      rawBody,
      signature: request.headers.get("x-syntha-signature"),
      timestamp: request.headers.get("x-syntha-timestamp"),
      keyId: request.headers.get("x-syntha-key-id"),
    });
    const headerOrganizationId = request.headers.get(
      "x-syntha-organization-id",
    );
    if (
      headerOrganizationId &&
      normalizeCommercialOrganizationId(headerOrganizationId) !==
        parsed.organizationId
    ) {
      throw new Error("Callback organization id does not match the header.");
    }
    const keys = await commercialRuntime.signingKeys.load(
      integrationId,
      parsed.organizationId,
    );
    const verifier = new HmacIntegrationCallbackVerifier(keys);
    const result = await commercialRuntime.unitOfWork.execute((repository) =>
      verifyAndReconcileIntegrationCallback({
        verifier,
        verificationRequest: parsed.verificationRequest,
        repository: scopeCommercialWorkflowRepository(
          repository,
          parsed.organizationId,
        ),
        workflowId,
        callback: parsed.callback,
        receivedAt,
      }),
    );
    if (result.status === "rejected") {
      return NextResponse.json(
        { error: "invalid_signature", reason: result.verification.reason },
        { status: 401 },
      );
    }
    return NextResponse.json(
      {
        organizationId: parsed.organizationId,
        status: result.reconciliation.status,
        eventId: result.reconciliation.inboxRecord.id,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "invalid_callback" },
      { status: 400 },
    );
  }
}
