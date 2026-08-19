import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.session?.userId && req.session?.username) {
      res.locals.currentUser = {
        id: req.session.userId,
        username: req.session.username,
      };
    } else {
      res.locals.currentUser = null;
    }

    if (req.session?.flash) {
      res.locals.flash = req.session.flash;
      req.session.flash = undefined;
    } else {
      res.locals.flash = undefined;
    }

    next();
  }
}
