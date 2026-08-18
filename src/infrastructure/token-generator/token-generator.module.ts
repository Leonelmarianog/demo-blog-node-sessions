import { Module } from '@nestjs/common';
import { TokenGenerator } from '@application/contracts/token-generator.interface';
import { UuidTokenGenerator } from './uuid-token-generator';

@Module({
  providers: [{ provide: TokenGenerator, useClass: UuidTokenGenerator }],
  exports: [TokenGenerator],
})
export class TokenGeneratorModule {}
