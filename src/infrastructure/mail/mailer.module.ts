import { Module } from '@nestjs/common';
import { Mailer } from '@application/contracts/mailer.interface';
import { ConsoleMailer } from './console-mailer';

@Module({
  providers: [{ provide: Mailer, useClass: ConsoleMailer }],
  exports: [Mailer],
})
export class MailerModule {}
