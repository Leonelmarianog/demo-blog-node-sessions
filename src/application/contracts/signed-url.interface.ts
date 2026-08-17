export interface SignedUrlResult {
  readonly valid: boolean;
  readonly expired: boolean;
}

export abstract class SignedUrl {
  abstract sign(url: string, ttlSeconds: number): string;
  abstract validate(url: string): SignedUrlResult;
}
