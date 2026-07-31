import type { Metadata } from 'next';
import { WholesaleWorkspace } from '@/components/wholesale-v2/WholesaleWorkspace';

export const metadata: Metadata = {
  title: 'Wholesale V2 | Syntha',
  description: 'Actor-scoped B2B wholesale workspace',
};

export default function WholesaleV2Page() {
  return <WholesaleWorkspace />;
}
