'use client';

import { WorkspaceErrorState } from '@/shared/workspace/components';

export default function Error({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  return <WorkspaceErrorState retry={reset} code={error.digest} />;
}
