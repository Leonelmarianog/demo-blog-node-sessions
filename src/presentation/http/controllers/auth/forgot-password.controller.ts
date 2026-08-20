import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { RequestPasswordResetUseCase } from '@application/use-cases/auth/request-password-reset/request-password-reset.use-case';
import { RequestPasswordResetDto } from '@application/use-cases/auth/request-password-reset/request-password-reset.dto';
import { ValidationException } from '@domain/exceptions/validation.exception';

interface ForgotPasswordRequest {
  email?: string;
}

const baseModel = () => ({
  appTitle: 'Demo Blog',
  year: new Date().getFullYear(),
});

@Controller()
export class ForgotPasswordController {
  constructor(
    private readonly requestPasswordReset: RequestPasswordResetUseCase,
  ) {}

  @Post('forgot-password')
  @HttpCode(200)
  async submit(
    @Body() body: ForgotPasswordRequest,
    @Res() res: Response,
  ): Promise<void> {
    const dto = new RequestPasswordResetDto(body.email ?? '');

    try {
      await this.requestPasswordReset.execute(dto);
    } catch (error) {
      if (error instanceof ValidationException) {
        res.render('pages/forgot-password', {
          ...baseModel(),
          values: { email: dto.email },
          errors: this.toErrorMap(error.notification),
        });
        return;
      }

      throw error;
    }

    res.redirect('/forgot-password/sent');
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
