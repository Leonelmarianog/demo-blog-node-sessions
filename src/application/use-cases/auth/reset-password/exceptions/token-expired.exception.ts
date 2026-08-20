import { ApplicationException } from '@application/exceptions/application.exception';

export class TokenExpiredException extends ApplicationException {
  constructor() {
    super('The reset link has expired. Request a new one.');
  }
}
