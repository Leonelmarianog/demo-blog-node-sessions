import request from 'supertest';
import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterUserUseCase } from '@application/use-cases/auth/register-user/register-user.use-case';
import { RegisterUserDto } from '@application/use-cases/auth/register-user/register-user.dto';

/**
 * Registers and activates morgan, then signs in and returns a supertest
 * agent that holds the session cookie. Use it to reach routes that the
 * RequireSessionMiddleware gates. Each call seeds its own user, so pair
 * it with resetDatabase() in afterEach.
 */
export async function createAuthenticatedAgent(
  app: INestApplication,
  email = 'morgan@example.com',
) {
  const registerUser = app.get(RegisterUserUseCase);
  const dataSource = app.get(DataSource);
  await registerUser.execute(
    new RegisterUserDto(email, 'morgan', 'Password1', 'Password1'),
  );
  await dataSource.query(
    'UPDATE users SET account_state = $1, email_verified_at = $2 WHERE email = $3',
    ['active', new Date(), email],
  );
  const agent = request.agent(app.getHttpServer() as Server);
  await agent.post('/login').send({ email, password: 'Password1' }).expect(302);
  return agent;
}
