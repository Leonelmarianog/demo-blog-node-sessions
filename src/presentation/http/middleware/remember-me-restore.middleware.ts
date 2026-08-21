import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RestoreRememberMeSessionUseCase } from '@application/use-cases/auth/restore-remember-me-session/restore-remember-me-session.use-case';
import {
  RememberMeCookieService,
  REMEMBER_ME_COOKIE_NAME,
} from '@presentation/http/cookies/remember-me-cookie.service';

@Injectable()
export class RememberMeRestoreMiddleware implements NestMiddleware {
  constructor(
    private readonly restoreUseCase: RestoreRememberMeSessionUseCase,
    private readonly rememberMeCookieService: RememberMeCookieService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    if (req.session?.userId) {
      next();
      return;
    }

    const rawToken = req.cookies?.[REMEMBER_ME_COOKIE_NAME] as
      string | undefined;

    if (!rawToken) {
      next();
      return;
    }

    this.restoreUseCase
      .execute(rawToken)
      .then((result) => {
        if (!result) {
          this.rememberMeCookieService.clear(res);
          next();
          return;
        }
        req.session.userId = result.userId;
        req.session.username = result.username;
        this.rememberMeCookieService.set(res, result.newRawToken);
        next();
      })
      .catch((error) => {
        this.rememberMeCookieService.clear(res);
        next(error);
      });
  }
}
