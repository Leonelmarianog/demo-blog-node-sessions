import { DomainException } from './domain.exception';
import { Notification } from '../notification';

export class ValidationException extends DomainException {
  constructor(public readonly notification: Notification) {
    super('Validation failed.');
  }
}
