import { Notification } from './notification';

describe('Notification', () => {
  it('starts with no errors', () => {
    const notification = new Notification();
    expect(notification.hasErrors).toBe(false);
    expect(notification.errors).toEqual([]);
  });

  it('collects errors by field name', () => {
    const notification = new Notification();
    notification.addError('email', 'Email is required.');
    notification.addError('password', 'Password is too short.');
    expect(notification.hasErrors).toBe(true);
    expect(notification.errors).toEqual([
      { field: 'email', message: 'Email is required.' },
      { field: 'password', message: 'Password is too short.' },
    ]);
  });

  it('reports whether a field has an error', () => {
    const notification = new Notification();
    notification.addError('email', 'Email is required.');
    expect(notification.includes('email')).toBe(true);
    expect(notification.includes('password')).toBe(false);
  });

  it('keeps errors readonly', () => {
    const notification = new Notification();
    notification.addError('email', 'Email is required.');
    expect(() =>
      (
        notification.errors as unknown as { field: string; message: string }[]
      ).push({ field: 'x', message: 'y' }),
    ).not.toThrow();
    expect(notification.errors).toHaveLength(1);
  });
});
