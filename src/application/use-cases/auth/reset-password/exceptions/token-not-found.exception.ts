import { ApplicationException } from '@application/exceptions/application.exception';

export class TokenNotFoundException extends ApplicationException {
  constructor() {
    super('The reset link is invalid.');
  }
}
