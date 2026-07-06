/**
 * Platform Core demo: presign + upload без S3 (только PG + virus-scan stub).
 */
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2VaultS3Configured } from '@/lib/server/workshop2-vault-s3';

function isPublicCoreMode(env: Record<string, string | undefined> = process.env): boolean {
  const raw = String(env.NEXT_PUBLIC_PLATFORM_CORE_MODE ?? '').trim().toLowerCase();
  return raw === '1' || raw === 'true';
}

export function isWorkshop2VaultPresignCoreDemoBypassEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  return (
    isPublicCoreMode(env) &&
    isWorkshop2PostgresEnabled() &&
    !isWorkshop2VaultS3Configured()
  );
}

export function buildWorkshop2VaultDemoStoragePath(input: {
  collectionId: string;
  articleId: string;
  documentId: string;
}): string {
  const col = encodeURIComponent(input.collectionId.trim());
  const art = encodeURIComponent(input.articleId.trim());
  const doc = encodeURIComponent(input.documentId.trim());
  return `demo://vault/${col}/${art}/${doc}`;
}

export function buildWorkshop2VaultDemoIngestUrl(input: {
  collectionId: string;
  articleId: string;
  documentId: string;
}): string {
  const params = new URLSearchParams({ documentId: input.documentId.trim() });
  return `/api/workshop2/articles/${encodeURIComponent(input.collectionId)}/${encodeURIComponent(input.articleId)}/vault/demo-ingest?${params}`;
}
