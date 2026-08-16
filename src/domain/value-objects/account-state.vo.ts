export enum AccountStateValue {
  Unverified = 'unverified',
  Active = 'active',
  SelfDeactivated = 'self-deactivated',
  Suspended = 'suspended',
}

export class AccountState {
  private constructor(private _value: AccountStateValue) {}

  public static from(value: string): AccountState {
    const state = Object.values(AccountStateValue).find(
      (v) => v === (value as AccountStateValue),
    );

    if (!state) {
      throw new Error(`Unknown account state: ${value}.`);
    }

    return new AccountState(state);
  }

  public static unverified(): AccountState {
    return new AccountState(AccountStateValue.Unverified);
  }

  public get value(): AccountStateValue {
    return this._value;
  }

  public activate(): void {
    if (this._value === AccountStateValue.Suspended) {
      throw new Error('A suspended account cannot be activated by the user.');
    }
    this._value = AccountStateValue.Active;
  }

  public suspend(): void {
    this._value = AccountStateValue.Suspended;
  }

  public selfDeactivate(): void {
    this._value = AccountStateValue.SelfDeactivated;
  }

  public reactivate(): void {
    if (this._value !== AccountStateValue.SelfDeactivated) {
      throw new Error('Only a self-deactivated account can reactivate.');
    }
    this._value = AccountStateValue.Active;
  }
}
