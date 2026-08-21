import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ResendVerificationEmailUseCase } from '@application/use-cases/auth/resend-verification-email/resend-verification-email.use-case';
import { ResendVerificationEmailDto } from '@application/use-cases/auth/resend-verification-email/resend-verification-email.dto';
import { ValidationException } from '@domain/exceptions/validation.exception';

interface ResendVerificationEmailRequest {
  email?: string;
}

const baseModel = () => ({
  appTitle: 'Demo Blog',
  year: new Date().getFullYear(),
});

@Controller()
export class ResendVerificationEmailController {
  constructor(
    private readonly resendVerificationEmail: ResendVerificationEmailUseCase,
  ) {}

  @Post('verify-email/resend')
  @HttpCode(200)
  async submit(
    @Body() body: ResendVerificationEmailRequest,
    @Res() res: Response,
  ): Promise<void> {
    const dto = new ResendVerificationEmailDto(body.email ?? '');

    try {
      await this.resendVerificationEmail.execute(dto);
    } catch (error) {
      if (error instanceof ValidationException) {
        res.render('pages/resend-verification-email', {
          ...baseModel(),
          values: { email: dto.email },
          errors: this.toErrorMap(error.notification),
        });
        return;
      }

      throw error;
    }

    res.redirect('/verify-email/sent');
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
