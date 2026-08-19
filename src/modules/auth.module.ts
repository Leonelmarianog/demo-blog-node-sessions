import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { VerificationTokenEntity } from '@infrastructure/database/entities/verification-token.entity';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { TypeOrmRegisterUserRepository } from '@infrastructure/database/repositories/typeorm-register-user.repository';
import { HasherModule } from '@infrastructure/hasher/hasher.module';
import { UrlSignerModule } from '@infrastructure/url-signer/url-signer.module';
import { TokenGeneratorModule } from '@infrastructure/token-generator/token-generator.module';
import { MailerModule } from '@infrastructure/mail/mailer.module';
import { Hasher } from '@application/contracts/hasher.interface';
import { UnitOfWork } from '@application/contracts/unit-of-work.interface';
import { Mailer } from '@application/contracts/mailer.interface';
import { UrlSigner } from '@application/contracts/url-signer.interface';
import { TokenGenerator } from '@application/contracts/token-generator.interface';
import { RegisterUserRepository } from '@application/use-cases/auth/register-user/register-user.repository.interface';
import { RegisterUserUseCase } from '@application/use-cases/auth/register-user/register-user.use-case';
import { AuthController } from '@presentation/http/controllers/auth/auth.controller';
import { RegisterUserController } from '@presentation/http/controllers/auth/register-user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, VerificationTokenEntity]),
    DatabaseModule,
    HasherModule,
    UrlSignerModule,
    TokenGeneratorModule,
    MailerModule,
  ],
  controllers: [AuthController, RegisterUserController],
  providers: [
    {
      provide: RegisterUserRepository,
      useClass: TypeOrmRegisterUserRepository,
    },
    {
      provide: RegisterUserUseCase,
      useFactory: (
        users: RegisterUserRepository,
        hasher: Hasher,
        uow: UnitOfWork,
        mailer: Mailer,
        urlSigner: UrlSigner,
        tokenGenerator: TokenGenerator,
        config: ConfigService,
      ) =>
        new RegisterUserUseCase(
          users,
          hasher,
          uow,
          mailer,
          urlSigner,
          tokenGenerator,
          config.get<number>('VERIFICATION_TOKEN_TTL_SECONDS')!,
          config.get<string>('APP_BASE_URL')!,
        ),
      inject: [
        RegisterUserRepository,
        Hasher,
        UnitOfWork,
        Mailer,
        UrlSigner,
        TokenGenerator,
        ConfigService,
      ],
    },
  ],
})
export class AuthModule {}
