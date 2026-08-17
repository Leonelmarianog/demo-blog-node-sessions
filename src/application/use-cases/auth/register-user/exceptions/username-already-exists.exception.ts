import { ApplicationException } from '@application/exceptions/application.exception';

export class UsernameAlreadyExistsException extends ApplicationException {
  constructor() {
    super('Username already taken.');
  }
}
