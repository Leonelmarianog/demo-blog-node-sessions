import { ApplicationException } from '@application/exceptions/application.exception';

export class InvalidCredentialsException extends ApplicationException {
  constructor() {
    super('Email or password is incorrect.');
  }
}
