import { Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller()
export class LogoutController {
  private readonly logger = new Logger(LogoutController.name);

  @Post('logout')
  submit(@Req() req: Request, @Res() res: Response): void {
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
