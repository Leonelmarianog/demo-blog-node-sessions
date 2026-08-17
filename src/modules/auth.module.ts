import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { VerificationTokenEntity } from '@infrastructure/database/entities/verification-token.entity';
import { TypeOrmRegisterUserRepository } from '@infrastructure/database/repositories/typeorm-register-user.repository';
import { Argon2PasswordHasher } from '@infrastructure/auth/argon2-password-hasher';
import { TypeOrmUnitOfWork } from '@infrastructure/database/transactions/typeorm-unit-of-work';
import { ConsoleMailer } from '@infrastructure/mail/console-mailer';
import { UuidTokenGenerator } from '@infrastructure/auth/token-generator';
import { HmacUrlSigner } from '@infrastructure/auth/url-signer';
import { PasswordHasher } from '@application/contracts/password-hasher.interface';
import { UnitOfWork } from '@application/contracts/unit-of-work.interface';
import { Mailer } from '@application/contracts/mailer.interface';
import { UrlSigner } from '@application/contracts/url-signer.interface';
import { TokenGenerator } from '@application/contracts/token-generator.interface';
import { RegisterUserRepository } from '@application/use-cases/auth/register-user/register-user.repository.interface';
import { RegisterUserUseCase } from '@application/use-cases/auth/register-user/register-user.use-case';
import { AuthController } from '@presentation/http/controllers/auth/auth.controller';
import { RegisterUserController } from '@presentation/http/controllers/auth/register-user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, VerificationTokenEntity])],
  controllers: [AuthController, RegisterUserController],
  providers: [
    { provide: PasswordHasher, useClass: Argon2PasswordHasher },
    { provide: UnitOfWork, useClass: TypeOrmUnitOfWork },
    { provide: Mailer, useClass: ConsoleMailer },
    { provide: TokenGenerator, useClass: UuidTokenGenerator },
    {
      provide: UrlSigner,
      useFactory: (config: ConfigService) =>
        new HmacUrlSigner(config.get<string>('SESSION_SECRET')!),
      inject: [ConfigService],
    },
    {
      provide: RegisterUserRepository,
      useClass: TypeOrmRegisterUserRepository,
    },
    {
      provide: RegisterUserUseCase,
      useFactory: (
        users: RegisterUserRepository,
        hasher: PasswordHasher,
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
        PasswordHasher,
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
