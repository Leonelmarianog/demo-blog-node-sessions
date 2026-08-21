export class LoginResult {
  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly rememberMeToken: string | null,
  ) {}
}
