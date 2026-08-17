/** The result of validating a signed URL. */
export interface SignedUrlResult {
  /** True when the signature is correct and the URL is not expired. */
  readonly valid: boolean;
  /** True when the signature was correct, but the URL is expired. */
  readonly expired: boolean;
}

export abstract class UrlSigner {
  /** Returns the given URL with a signature and an expiry time. */
  abstract sign(url: string, ttlSeconds: number): string;

  /** Validates a signed URL and reports whether it is valid or expired. */
  abstract validate(url: string): SignedUrlResult;
}
