export const SIGNED_URL = 'SIGNED_URL';

export interface SignedUrlResult {
  readonly valid: boolean;
  readonly expired: boolean;
}

export interface SignedUrl {
  sign(url: string, ttlSeconds: number): string;
  validate(url: string): SignedUrlResult;
}
