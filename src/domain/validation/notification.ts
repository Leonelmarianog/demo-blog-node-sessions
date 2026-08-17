export interface ValidationError {
  readonly field: string;
  readonly message: string;
}

export class Notification {
  private readonly _errors: ValidationError[] = [];

  /** Records an error for the given field. */
  public addError(field: string, message: string): void {
    this._errors.push({ field, message });
  }

  public get errors(): readonly ValidationError[] {
    return [...this._errors];
  }

  public get hasErrors(): boolean {
    return this._errors.length > 0;
  }

  /** Returns whether an error was recorded for the given field. */
  public includes(field: string): boolean {
    return this._errors.some((error) => error.field === field);
  }
}
