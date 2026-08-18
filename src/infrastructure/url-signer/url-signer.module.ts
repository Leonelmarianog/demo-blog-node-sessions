import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UrlSigner } from '@application/contracts/url-signer.interface';
import { HmacUrlSigner } from './hmac-url-signer';

@Module({
  providers: [
    {
      provide: UrlSigner,
      useFactory: (config: ConfigService) =>
        new HmacUrlSigner(config.get<string>('SESSION_SECRET')!),
      inject: [ConfigService],
    },
  ],
  exports: [UrlSigner],
})
export class UrlSignerModule {}
