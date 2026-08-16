import { VerificationToken } from './verification-token';

describe('VerificationToken', () => {
  it('create() sets the token, user, and a future expiry', () => {
    const token = VerificationToken.create('abc', 'user-1', 3600);
    expect(token.token).toBe('abc');
    expect(token.userId).toBe('user-1');
    expect(token.isExpired()).toBe(false);
    expect(token.isValid()).toBe(true);
  });

  it('from() reconstitutes a token without recomputing the expiry', () => {
    const past = new Date(Date.now() - 1000);
    const token = VerificationToken.from('abc', 'user-1', past);
    expect(token.isExpired()).toBe(true);
    expect(token.isValid()).toBe(false);
  });
});
