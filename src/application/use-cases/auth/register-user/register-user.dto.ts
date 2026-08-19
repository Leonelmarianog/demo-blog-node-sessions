export class RegisterUserDto {
  constructor(
    public readonly email: string,
    public readonly username: string,
    public readonly password: string,
    public readonly confirmPassword: string,
  ) {}
}
