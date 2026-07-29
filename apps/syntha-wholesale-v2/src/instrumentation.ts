export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.SYNTHA_COMMERCIAL_EXECUTION_ENABLED !== "true") return;
  const { bootstrapCommercialExecutionRuntimeFromEnvironment } = await import(
    "@/modules/commercial-execution"
  );
  await bootstrapCommercialExecutionRuntimeFromEnvironment();
}
