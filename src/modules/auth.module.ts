import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { VerificationTokenEntity } from '@infrastructure/database/entities/verification-token.entity';
import { TypeOrmRegisterUserRepository } from '@infrastructure/database/repositories/typeorm-register-user.repository';
import { Argon2PasswordHasher } from '@infrastructure/auth/argon2-password-hasher';
import { TypeOrmUnitOfWork } from '@infrastructure/database/typeorm-unit-of-work';
import { ConsoleMailer } from '@infrastructure/mail/console-mailer';
import { UuidTokenGenerator } from '@infrastructure/auth/token-generator';
import { HmacSignedUrl } from '@infrastructure/auth/signed-url';
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from '@application/contracts/password-hasher.interface';
import {
  UNIT_OF_WORK,
  UnitOfWork,
} from '@application/contracts/unit-of-work.interface';
import { MAILER, Mailer } from '@application/contracts/mailer.interface';
import {
  SIGNED_URL,
  SignedUrl,
} from '@application/contracts/signed-url.interface';
import {
  TOKEN_GENERATOR,
  TokenGenerator,
} from '@application/contracts/token-generator.interface';
import {
  REGISTER_USER_REPOSITORY,
  RegisterUserRepository,
} from '@application/use-cases/auth/register-user/register-user.repository.interface';
import { RegisterUserUseCase } from '@application/use-cases/auth/register-user/register-user.use-case';
import { AuthController } from '@presentation/http/controllers/auth/auth.controller';
import { RegisterUserController } from '@presentation/http/controllers/auth/register-user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, VerificationTokenEntity])],
  controllers: [AuthController, RegisterUserController],
  providers: [
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    { provide: UNIT_OF_WORK, useClass: TypeOrmUnitOfWork },
    { provide: MAILER, useClass: ConsoleMailer },
    { provide: TOKEN_GENERATOR, useClass: UuidTokenGenerator },
    {
      provide: SIGNED_URL,
      useFactory: (config: ConfigService) =>
        new HmacSignedUrl(config.get<string>('SESSION_SECRET')!),
      inject: [ConfigService],
    },
    {
      provide: REGISTER_USER_REPOSITORY,
      useClass: TypeOrmRegisterUserRepository,
    },
    {
      provide: RegisterUserUseCase,
      useFactory: (
        users: RegisterUserRepository,
        hasher: PasswordHasher,
        uow: UnitOfWork,
        mailer: Mailer,
        signedUrl: SignedUrl,
        tokenGenerator: TokenGenerator,
        config: ConfigService,
      ) =>
        new RegisterUserUseCase(
          users,
          hasher,
          uow,
          mailer,
          signedUrl,
          tokenGenerator,
          config.get<number>('VERIFICATION_TOKEN_TTL_SECONDS')!,
          config.get<string>('APP_BASE_URL')!,
        ),
      inject: [
        REGISTER_USER_REPOSITORY,
        PASSWORD_HASHER,
        UNIT_OF_WORK,
        MAILER,
        SIGNED_URL,
        TOKEN_GENERATOR,
        ConfigService,
      ],
    },
  ],
})
export class AuthModule {}
