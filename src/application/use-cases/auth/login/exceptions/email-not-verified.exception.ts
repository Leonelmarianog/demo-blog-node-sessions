import { ApplicationException } from '@application/exceptions/application.exception';

export class EmailNotVerifiedException extends ApplicationException {
  constructor() {
    super('Please verify your email before you sign in.');
  }
}
