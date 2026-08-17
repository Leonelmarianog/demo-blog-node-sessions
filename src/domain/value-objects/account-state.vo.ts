export enum AccountStateValue {
  Unverified = 'unverified',
  Active = 'active',
  SelfDeactivated = 'self-deactivated',
  Suspended = 'suspended',
}

export class AccountState {
  private constructor(private _value: AccountStateValue) {}

  /** Rebuilds an account state from its stored string value. */
  public static from(value: string): AccountState {
    const state = Object.values(AccountStateValue).find(
      (v) => v === (value as AccountStateValue),
    );

    if (!state) {
      throw new Error(`Unknown account state: ${value}.`);
    }

    return new AccountState(state);
  }

  /** Returns a new unverified account state. */
  public static unverified(): AccountState {
    return new AccountState(AccountStateValue.Unverified);
  }

  public get value(): AccountStateValue {
    return this._value;
  }

  /** Activates the account. A suspended account cannot be activated. */
  public activate(): void {
    if (this._value === AccountStateValue.Suspended) {
      throw new Error('A suspended account cannot be activated by the user.');
    }
    this._value = AccountStateValue.Active;
  }

  /** Suspends the account. */
  public suspend(): void {
    this._value = AccountStateValue.Suspended;
  }

  /** Marks the account as self-deactivated by its owner. */
  public selfDeactivate(): void {
    this._value = AccountStateValue.SelfDeactivated;
  }

  /** Reactivates a self-deactivated account. Throws otherwise. */
  public reactivate(): void {
    if (this._value !== AccountStateValue.SelfDeactivated) {
      throw new Error('Only a self-deactivated account can reactivate.');
    }
    this._value = AccountStateValue.Active;
  }
}
