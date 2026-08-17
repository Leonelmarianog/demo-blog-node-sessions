export abstract class Mailer {
  abstract send(to: string, subject: string, body: string): Promise<void>;
}
