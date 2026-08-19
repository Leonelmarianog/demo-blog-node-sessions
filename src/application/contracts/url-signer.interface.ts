export interface SignedUrlResult {
  readonly valid: boolean;
  readonly expired: boolean;
}

export abstract class UrlSigner {
  /** Returns the given URL with a signature and an expiry time. */
  abstract sign(url: string, ttlSeconds: number): string;

  /** Validates a signed URL and reports whether it is valid or expired. */
  abstract validate(url: string): SignedUrlResult;
}
