import { UuidTokenGenerator } from './token-generator';

describe('UuidTokenGenerator', () => {
  it('generates a non-empty uuid string', () => {
    const generator = new UuidTokenGenerator();
    expect(generator.generate()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('generates a different value each call', () => {
    const generator = new UuidTokenGenerator();
    expect(generator.generate()).not.toBe(generator.generate());
  });
});
