import { HmacSignedUrl } from './signed-url';

describe('HmacSignedUrl', () => {
  const signer = new HmacSignedUrl('a-test-secret-of-at-least-32-characters!');

  it('signs a URL and validates it', () => {
    const signed = signer.sign('/verify-email?token=abc', 3600);
    const result = signer.validate(signed);
    expect(result.valid).toBe(true);
    expect(result.expired).toBe(false);
  });

  it('rejects a tampered URL', () => {
    const signed = signer.sign('/verify-email?token=abc', 3600);
    const tampered = signed.replace('token=abc', 'token=xyz');
    const result = signer.validate(tampered);
    expect(result.valid).toBe(false);
    expect(result.expired).toBe(false);
  });

  it('reports an expired but correctly signed URL', () => {
    const signed = signer.sign('/verify-email?token=abc', -1);
    const result = signer.validate(signed);
    expect(result.valid).toBe(false);
    expect(result.expired).toBe(true);
  });

  it('rejects a URL without a signature', () => {
    const result = signer.validate('/verify-email?token=abc');
    expect(result.valid).toBe(false);
    expect(result.expired).toBe(false);
  });
});
