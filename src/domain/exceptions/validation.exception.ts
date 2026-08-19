import { DomainException } from './domain.exception';
import { Notification } from '../validation/notification';

export class ValidationException extends DomainException {
  constructor(public readonly notification: Notification) {
    super('Validation failed.');
  }
}
