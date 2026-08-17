import { Injectable } from '@nestjs/common';
import type { Mailer } from '@application/common/contracts/mailer.interface';

@Injectable()
export class ConsoleMailer implements Mailer {
  public send(to: string, subject: string, body: string): Promise<void> {
    console.log(`[Mailer] To: ${to} | Subject: ${subject}\n${body}`);
    return Promise.resolve();
  }
}
