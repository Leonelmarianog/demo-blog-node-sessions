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
import { VerifyEmailRepository } from '@application/use-cases/auth/verify-email/verify-email.repository.interface';
import { VerifyEmailUseCase } from '@application/use-cases/auth/verify-email/verify-email.use-case';
import { TypeOrmVerifyEmailRepository } from '@infrastructure/database/repositories/typeorm-verify-email.repository';
import { TypeOrmLoginUserRepository } from '@infrastructure/database/repositories/typeorm-login-user.repository';
import { LoginUserRepository } from '@application/use-cases/auth/login/login.repository.interface';
import { LoginUseCase } from '@application/use-cases/auth/login/login.use-case';
import { AuthController } from '@presentation/http/controllers/auth/auth.controller';
import { RegisterUserController } from '@presentation/http/controllers/auth/register-user.controller';
import { VerifyEmailController } from '@presentation/http/controllers/auth/verify-email.controller';
import { LoginUserController } from '@presentation/http/controllers/auth/login-user.controller';
import { LogoutController } from '@presentation/http/controllers/auth/logout.controller';
import { PasswordResetTokenEntity } from '@infrastructure/database/entities/password-reset-token.entity';
import { TypeOrmRequestPasswordResetRepository } from '@infrastructure/database/repositories/typeorm-request-password-reset.repository';
import { RequestPasswordResetRepository } from '@application/use-cases/auth/request-password-reset/request-password-reset.repository.interface';
import { RequestPasswordResetUseCase } from '@application/use-cases/auth/request-password-reset/request-password-reset.use-case';
import { ForgotPasswordController } from '@presentation/http/controllers/auth/forgot-password.controller';
import { TypeOrmResetPasswordRepository } from '@infrastructure/database/repositories/typeorm-reset-password.repository';
import { ResetPasswordRepository } from '@application/use-cases/auth/reset-password/reset-password.repository.interface';
import { ResetPasswordUseCase } from '@application/use-cases/auth/reset-password/reset-password.use-case';
import { ResetPasswordController } from '@presentation/http/controllers/auth/reset-password.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      VerificationTokenEntity,
      PasswordResetTokenEntity,
    ]),
    DatabaseModule,
    HasherModule,
    UrlSignerModule,
    TokenGeneratorModule,
    MailerModule,
  ],
  controllers: [
    AuthController,
    RegisterUserController,
    VerifyEmailController,
    LoginUserController,
    LogoutController,
    ForgotPasswordController,
    ResetPasswordController,
  ],
  providers: [
    {
      provide: RegisterUserRepository,
      useClass: TypeOrmRegisterUserRepository,
    },
    {
      provide: VerifyEmailRepository,
      useClass: TypeOrmVerifyEmailRepository,
    },
    {
      provide: LoginUserRepository,
      useClass: TypeOrmLoginUserRepository,
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
    {
      provide: VerifyEmailUseCase,
      useFactory: (tokens: VerifyEmailRepository, uow: UnitOfWork) =>
        new VerifyEmailUseCase(tokens, uow),
      inject: [VerifyEmailRepository, UnitOfWork],
    },
    {
      provide: LoginUseCase,
      useFactory: (
        users: LoginUserRepository,
        hasher: Hasher,
        uow: UnitOfWork,
      ) => new LoginUseCase(users, hasher, uow),
      inject: [LoginUserRepository, Hasher, UnitOfWork],
    },
    {
      provide: RequestPasswordResetRepository,
      useClass: TypeOrmRequestPasswordResetRepository,
    },
    {
      provide: RequestPasswordResetUseCase,
      useFactory: (
        users: RequestPasswordResetRepository,
        mailer: Mailer,
        urlSigner: UrlSigner,
        tokenGenerator: TokenGenerator,
        uow: UnitOfWork,
        config: ConfigService,
      ) =>
        new RequestPasswordResetUseCase(
          users,
          mailer,
          urlSigner,
          tokenGenerator,
          uow,
          config.get<number>('PASSWORD_RESET_TOKEN_TTL_SECONDS')!,
          config.get<string>('APP_BASE_URL')!,
        ),
      inject: [
        RequestPasswordResetRepository,
        Mailer,
        UrlSigner,
        TokenGenerator,
        UnitOfWork,
        ConfigService,
      ],
    },
    {
      provide: ResetPasswordRepository,
      useClass: TypeOrmResetPasswordRepository,
    },
    {
      provide: ResetPasswordUseCase,
      useFactory: (
        tokens: ResetPasswordRepository,
        hasher: Hasher,
        uow: UnitOfWork,
      ) => new ResetPasswordUseCase(tokens, hasher, uow),
      inject: [ResetPasswordRepository, Hasher, UnitOfWork],
    },
  ],
})
export class AuthModule {}
