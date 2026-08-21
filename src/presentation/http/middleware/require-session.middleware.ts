import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * Gates protected routes on a live session. Runs after the remember-me
 * restore + current-user chain, so a restored session counts. Checks only
 * "has a session" — role and account-state enforcement is a later concern.
 */
@Injectable()
export class RequireSessionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.session?.userId) {
      next();
      return;
    }
    res.redirect('/login');
  }
}
