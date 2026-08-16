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
import { RegisterUserUseCase } from '@application/use-cases/auth/register-user/register-user.use-case';
import { RegisterUserDto } from '@application/use-cases/auth/register-user/register-user.dto';
import { RegisterUserRequest } from '@presentation/http/requests/register-user.request';
import { ValidationException } from '@domain/exceptions/validation.exception';
import { EmailAlreadyExistsException } from '@application/use-cases/auth/register-user/Exceptions/email-already-exists.exception';
import { UsernameAlreadyExistsException } from '@application/use-cases/auth/register-user/Exceptions/username-already-exists.exception';

const baseModel = () => ({
  appTitle: 'Demo Blog',
  year: new Date().getFullYear(),
});

@Controller()
export class RegisterUserController {
  constructor(private readonly registerUser: RegisterUserUseCase) {}

  @Get('register')
  @Render('pages/register')
  register(): object {
    return baseModel();
  }

  @Post('register')
  @HttpCode(200)
  async submit(
    @Body() body: RegisterUserRequest,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const dto = new RegisterUserDto(
      body.email ?? '',
      body.username ?? '',
      body.password ?? '',
      body.confirmPassword ?? '',
    );
    const values = { email: dto.email, username: dto.username };

    try {
      await this.registerUser.execute(dto);
    } catch (error) {
      if (error instanceof ValidationException) {
        res.render('pages/register', {
          ...baseModel(),
          values,
          errors: this.toErrorMap(error.notification),
        });
        return;
      }

      if (error instanceof EmailAlreadyExistsException) {
        res.render('pages/register', {
          ...baseModel(),
          values,
          errors: { email: error.message },
        });
        return;
      }

      if (error instanceof UsernameAlreadyExistsException) {
        res.render('pages/register', {
          ...baseModel(),
          values,
          errors: { username: error.message },
        });
        return;
      }

      throw error;
    }

    req.session.flash =
      'We sent a verification link to your email. Open it to verify your account.';
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
