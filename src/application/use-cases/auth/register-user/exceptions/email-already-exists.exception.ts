import { ApplicationException } from '@application/exceptions/application.exception';

export class EmailAlreadyExistsException extends ApplicationException {
  constructor() {
    super('Email already registered.');
  }
}
