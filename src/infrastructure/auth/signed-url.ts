import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
  SignedUrl,
  SignedUrlResult,
} from '@application/common/contracts/signed-url.interface';

export class HmacSignedUrl implements SignedUrl {
  constructor(private readonly secret: string) {
    if (!secret || secret.length < 32) {
      throw new Error('The signed url secret must be at least 32 characters.');
    }
  }

  public sign(url: string, ttlSeconds: number): string {
    const base = new URL(url, 'http://placeholder.invalid');
    base.searchParams.set(
      'expires',
      String(Math.floor(Date.now() / 1000) + ttlSeconds),
    );
    base.searchParams.set('sig', this.signature(base.pathname + base.search));
    return base.pathname + base.search;
  }

  public validate(url: string): SignedUrlResult {
    let parsed: URL;
    try {
      parsed = new URL(url, 'http://placeholder.invalid');
    } catch {
      return { valid: false, expired: false };
    }

    const expires = parsed.searchParams.get('expires');
    const sig = parsed.searchParams.get('sig');

    if (!expires || !sig) {
      return { valid: false, expired: false };
    }

    const expiresEpoch = Number(expires);

    if (!Number.isInteger(expiresEpoch)) {
      return { valid: false, expired: false };
    }

    parsed.searchParams.delete('sig');
    const expected = this.signature(parsed.pathname + parsed.search);

    if (!this.safeEqual(expected, sig)) {
      return { valid: false, expired: false };
    }

    if (Math.floor(Date.now() / 1000) >= expiresEpoch) {
      return { valid: false, expired: true };
    }

    return { valid: true, expired: false };
  }

  private signature(data: string): string {
    return createHmac('sha256', this.secret)
      .update(data, 'utf8')
      .digest('base64url');
  }

  private safeEqual(a: string, b: string): boolean {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);

    if (aBuf.length !== bBuf.length) {
      return false;
    }

    return timingSafeEqual(aBuf, bBuf);
  }
}
