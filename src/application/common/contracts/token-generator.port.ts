export const TOKEN_GENERATOR = 'TOKEN_GENERATOR';

export interface TokenGenerator {
  generate(): string;
}
