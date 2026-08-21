export class RestoreRememberMeSessionResult {
  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly newRawToken: string,
  ) {}
}
