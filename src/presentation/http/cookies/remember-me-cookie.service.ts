import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

export const REMEMBER_ME_COOKIE_NAME = 'remember_me';

@Injectable()
export class RememberMeCookieService {
  constructor(private readonly config: ConfigService) {}

  /** Sets the remember-me cookie with the raw token. */
  public set(res: Response, rawToken: string): void {
    res.cookie(REMEMBER_ME_COOKIE_NAME, rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.config.get<number>('REMEMBER_ME_TOKEN_TTL_SECONDS')! * 1000,
    });
  }

  /** Clears the remember-me cookie. */
  public clear(res: Response): void {
    res.clearCookie(REMEMBER_ME_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }
}
