export class LoginRequest {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly rememberMe?: string,
  ) {}
}
