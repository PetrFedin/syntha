import 'server-only';

/**
 * Единственная граница Platform Core → workshop2 dossier storage.
 * Gateway/API не импортируют workshop2-phase1-dossier-server-store напрямую.
 */
export {
  getWorkshop2ServerDossierRecord,
  getWorkshop2ServerDossierStoreMode,
} from '@/lib/server/workshop2-phase1-dossier-server-store';
