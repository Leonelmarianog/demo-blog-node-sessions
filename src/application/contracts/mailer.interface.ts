export abstract class Mailer {
  /** Sends an email message to the given address. */
  abstract send(to: string, subject: string, body: string): Promise<void>;
}
