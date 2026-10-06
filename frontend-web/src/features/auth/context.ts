import { createSessionContext } from '@ribas/shared-react';

import type { SessionContextValue } from './types';

/** Contexto de la sesión y su hook. El valor lo provee AuthProvider. */
export const { SessionContext, useSession } = createSessionContext<SessionContextValue>();
