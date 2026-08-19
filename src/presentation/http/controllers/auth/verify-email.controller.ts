import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { VerifyEmailUseCase } from '@application/use-cases/auth/verify-email/verify-email.use-case';
import { TokenNotFoundException } from '@application/use-cases/auth/verify-email/exceptions/token-not-found.exception';
import { TokenExpiredException } from '@application/use-cases/auth/verify-email/exceptions/token-expired.exception';
import { UrlSigner } from '@application/contracts/url-signer.interface';

const baseModel = () => ({
  appTitle: 'Demo Blog',
  year: new Date().getFullYear(),
});

@Controller()
export class VerifyEmailController {
  constructor(
    private readonly verifyEmail: VerifyEmailUseCase,
    private readonly urlSigner: UrlSigner,
  ) {}

  @Get('verify-email')
  async verify(
    @Query('token') token: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const result = this.urlSigner.validate(req.originalUrl);

    if (!result.valid) {
      const message = result.expired
        ? 'The verification link has expired. Request a new one.'
        : 'The verification link is invalid.';
      res.render('pages/verify-email-error', { ...baseModel(), message });
      return;
    }

    try {
      await this.verifyEmail.execute(token ?? '');
    } catch (error) {
      if (
        error instanceof TokenNotFoundException ||
        error instanceof TokenExpiredException
      ) {
        res.render('pages/verify-email-error', {
          ...baseModel(),
          message: error.message,
        });
        return;
      }

      throw error;
    }

    req.session.flash = 'Your email is verified. You can sign in now.';
    res.redirect('/login');
  }
}
