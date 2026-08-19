import { Module } from '@nestjs/common';
import { Hasher } from '@application/contracts/hasher.interface';
import { Argon2Hasher } from './argon2-hasher';

@Module({
  providers: [{ provide: Hasher, useClass: Argon2Hasher }],
  exports: [Hasher],
})
export class HasherModule {}
