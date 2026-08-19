import { ApplicationException } from '@application/exceptions/application.exception';

export class TokenNotFoundException extends ApplicationException {
  constructor() {
    super('The verification link is invalid.');
  }
}
