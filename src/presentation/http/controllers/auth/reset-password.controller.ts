import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResetPasswordUseCase } from '@application/use-cases/auth/reset-password/reset-password.use-case';
import { ResetPasswordDto } from '@application/use-cases/auth/reset-password/reset-password.dto';
import { UrlSigner } from '@application/contracts/url-signer.interface';
import { ValidationException } from '@domain/exceptions/validation.exception';
import { TokenNotFoundException } from '@application/use-cases/auth/reset-password/exceptions/token-not-found.exception';
import { TokenExpiredException } from '@application/use-cases/auth/reset-password/exceptions/token-expired.exception';

interface ResetPasswordRequest {
  password?: string;
  confirmPassword?: string;
}

const baseModel = () => ({
  appTitle: 'Demo Blog',
  year: new Date().getFullYear(),
});

@Controller()
export class ResetPasswordController {
  constructor(
    private readonly resetPassword: ResetPasswordUseCase,
    private readonly urlSigner: UrlSigner,
  ) {}

  @Get('reset-password')
  showForm(@Req() req: Request, @Res() res: Response): void {
    const result = this.urlSigner.validate(req.originalUrl);

    if (!result.valid) {
      const message = result.expired
        ? 'The reset link has expired. Request a new one.'
        : 'The reset link is invalid.';
      res.render('pages/reset-password-error', { ...baseModel(), message });
      return;
    }

    res.render('pages/reset-password', {
      ...baseModel(),
      formAction: req.originalUrl,
    });
  }

  @Post('reset-password')
  @HttpCode(200)
  async submit(
    @Query('token') token: string | undefined,
    @Body() body: ResetPasswordRequest,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const result = this.urlSigner.validate(req.originalUrl);

    if (!result.valid) {
      const message = result.expired
        ? 'The reset link has expired. Request a new one.'
        : 'The reset link is invalid.';
      res.render('pages/reset-password-error', { ...baseModel(), message });
      return;
    }

    const dto = new ResetPasswordDto(
      token ?? '',
      body.password ?? '',
      body.confirmPassword ?? '',
    );

    try {
      await this.resetPassword.execute(dto);
    } catch (error) {
      if (error instanceof ValidationException) {
        res.render('pages/reset-password', {
          ...baseModel(),
          formAction: req.originalUrl,
          values: {
            password: dto.password,
            confirmPassword: dto.confirmPassword,
          },
          errors: this.toErrorMap(error.notification),
        });
        return;
      }

      if (
        error instanceof TokenNotFoundException ||
        error instanceof TokenExpiredException
      ) {
        res.render('pages/reset-password-error', {
          ...baseModel(),
          message: error.message,
        });
        return;
      }

      throw error;
    }

    req.session.flash = 'Your password is reset. You can sign in now.';
    res.redirect('/login');
  }

  private toErrorMap(notification: {
    errors: readonly { field: string; message: string }[];
  }): Record<string, string> {
    const map: Record<string, string> = {};
    for (const error of notification.errors) {
      if (!map[error.field]) {
        map[error.field] = error.message;
      }
    }
    return map;
  }
}
