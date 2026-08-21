import { Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { RememberMeTokenStore } from '@application/contracts/remember-me-token-store.interface';
import {
  RememberMeCookieService,
  REMEMBER_ME_COOKIE_NAME,
} from '@presentation/http/cookies/remember-me-cookie.service';

@Controller()
export class LogoutController {
  private readonly logger = new Logger(LogoutController.name);

  constructor(
    private readonly rememberMeTokenStore: RememberMeTokenStore,
    private readonly rememberMeCookieService: RememberMeCookieService,
  ) {}

  @Post('logout')
  async submit(@Req() req: Request, @Res() res: Response): Promise<void> {
    const rawToken = req.cookies?.[REMEMBER_ME_COOKIE_NAME] as
      string | undefined;

    if (rawToken) {
      try {
        await this.rememberMeTokenStore.revoke(rawToken);
      } catch (error) {
        this.logger.error(
          `Failed to revoke remember-me token on logout: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    this.rememberMeCookieService.clear(res);

    req.session.destroy((err: unknown) => {
      if (err instanceof Error) {
        this.logger.error(
          `Failed to destroy session on logout: ${err.message}`,
        );
      }
      res.redirect('/login');
    });
  }
}
