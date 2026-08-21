import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginUseCase } from '@application/use-cases/auth/login/login.use-case';
import { LoginDto } from '@application/use-cases/auth/login/login.dto';
import { LoginRequest } from '@presentation/http/requests/login-user.request';
import { ValidationException } from '@domain/exceptions/validation.exception';
import { InvalidCredentialsException } from '@application/use-cases/auth/login/exceptions/invalid-credentials.exception';
import { EmailNotVerifiedException } from '@application/use-cases/auth/login/exceptions/email-not-verified.exception';
import { RememberMeCookieService } from '@presentation/http/cookies/remember-me-cookie.service';

const baseModel = () => ({
  appTitle: 'Demo Blog',
  year: new Date().getFullYear(),
});

@Controller()
export class LoginUserController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly rememberMeCookieService: RememberMeCookieService,
  ) {}

  @Get('login')
  @Render('pages/login')
  login(): object {
    return baseModel();
  }

  @Post('login')
  @HttpCode(200)
  async submit(
    @Body() body: LoginRequest,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const dto = new LoginDto(
      body.email ?? '',
      body.password ?? '',
      body.rememberMe === 'on',
    );
    const values = { email: dto.email };

    try {
      const result = await this.loginUseCase.execute(dto);
      req.session.userId = result.userId;
      req.session.username = result.username;
      if (result.rememberMeToken) {
        this.rememberMeCookieService.set(res, result.rememberMeToken);
      }
      res.redirect('/dashboard');
      return;
    } catch (error) {
      if (error instanceof ValidationException) {
        res.render('pages/login', {
          ...baseModel(),
          values,
          errors: this.toErrorMap(error.notification),
        });
        return;
      }

      if (
        error instanceof InvalidCredentialsException ||
        error instanceof EmailNotVerifiedException
      ) {
        res.render('pages/login', {
          ...baseModel(),
          values,
          errors: { form: error.message },
        });
        return;
      }

      throw error;
    }
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
