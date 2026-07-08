/**
 * Canonical EmptyState for Platform Core — re-export design-system.
 * Do not import `@/components/ui/empty-state` or `@/components/user/shared/empty-state` in Ring A.
 */
export { EmptyState as PlatformCoreEmptyState } from '@/components/design-system/empty-state';
export type { EmptyStateProps as PlatformCoreEmptyStateProps } from '@/components/design-system/empty-state';
