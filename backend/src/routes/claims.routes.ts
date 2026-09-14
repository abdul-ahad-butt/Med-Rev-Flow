import { Hono } from 'hono';
import { getClaims, getClaim, createClaim, updateClaim, deleteClaim, updateClaimStatus, addClaimNote, exportClaims } from '../controllers/claims.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { Permission } from '../middleware/permissions';

export const claimsRouter = new Hono();
claimsRouter.use('*', authenticate);
claimsRouter.use('*', requirePermission(Permission.VIEW_CLAIMS));

claimsRouter.get('/', getClaims);
claimsRouter.get('/export', exportClaims);
claimsRouter.post('/', requirePermission(Permission.VIEW_CLAIMS), createClaim);
claimsRouter.get('/:id', getClaim);
claimsRouter.patch('/:id', requirePermission(Permission.VIEW_CLAIMS), updateClaim);
claimsRouter.delete('/:id', requirePermission(Permission.EDIT_CLAIM), deleteClaim);
claimsRouter.post('/:id/status', requirePermission(Permission.VIEW_CLAIMS), updateClaimStatus);
claimsRouter.post('/:id/notes', addClaimNote);
