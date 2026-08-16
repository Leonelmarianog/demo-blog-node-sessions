import { AccountState } from './account-state.vo';

describe('AccountState', () => {
  it('from() reconstitutes each state', () => {
    expect(AccountState.from('unverified').value).toBe('unverified');
    expect(AccountState.from('active').value).toBe('active');
  });

  it('from() throws on an unknown state', () => {
    expect(() => AccountState.from('banned')).toThrow();
  });

  it('activate() moves unverified to active', () => {
    const state = AccountState.from('unverified');
    state.activate();
    expect(state.value).toBe('active');
  });

  it('suspend() moves active to suspended', () => {
    const state = AccountState.from('active');
    state.suspend();
    expect(state.value).toBe('suspended');
  });

  it('selfDeactivate() moves active to self-deactivated', () => {
    const state = AccountState.from('active');
    state.selfDeactivate();
    expect(state.value).toBe('self-deactivated');
  });

  it('reactivate() moves self-deactivated back to active but not suspended', () => {
    expect(() => AccountState.from('suspended').reactivate()).toThrow();
    const state = AccountState.from('self-deactivated');
    state.reactivate();
    expect(state.value).toBe('active');
  });
});
