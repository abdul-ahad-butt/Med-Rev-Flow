import { Hono } from 'hono';
import {
  getClaims, getClaim, createClaim, updateClaim, deleteClaim,
  updateClaimStatus, addClaimNote, exportClaims,
} from '../controllers/claims.controller';
import { authenticate } from '../middleware/auth';

export const claimsRouter = new Hono();
claimsRouter.use('*', authenticate);

claimsRouter.get('/', getClaims);
claimsRouter.post('/', createClaim);
claimsRouter.get('/export', exportClaims);
claimsRouter.get('/:id', getClaim);
claimsRouter.patch('/:id', updateClaim);
claimsRouter.delete('/:id', deleteClaim);
claimsRouter.patch('/:id/status', updateClaimStatus);
claimsRouter.post('/:id/notes', addClaimNote);
