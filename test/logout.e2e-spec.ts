import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'node:http';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';
import { resetDatabase } from './utils/db';
import { RegisterUserUseCase } from '@application/use-cases/auth/register-user/register-user.use-case';
import { RegisterUserDto } from '@application/use-cases/auth/register-user/register-user.dto';

describe('Logout (e2e)', () => {
  let app: INestApplication;
  let registerUser: RegisterUserUseCase;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await setupApp(app);
    await app.init();

    registerUser = app.get(RegisterUserUseCase);
    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await app.close();
    await resetDatabase();
  });

  async function seedActiveUser(email: string): Promise<void> {
    await registerUser.execute(
      new RegisterUserDto(email, 'morgan', 'Password1', 'Password1'),
    );
    await dataSource.query(
      "UPDATE users SET account_state = 'active', email_verified_at = NOW() WHERE email = $1",
      [email],
    );
  }

  it('logs out a signed-in user and redirects to the login page', async () => {
    await seedActiveUser('morgan@example.com');

    const agent = request.agent(app.getHttpServer() as Server);
    await agent
      .post('/login')
      .send({ email: 'morgan@example.com', password: 'Password1' })
      .expect(302)
      .expect('Location', '/dashboard');

    await agent.post('/logout').expect(302).expect('Location', '/login');

    const home = await agent.get('/').expect(200);
    expect(home.text).not.toMatch(/Signed in as/);
    expect(home.text).toMatch(/href="\/login"/);
  });

  it('redirects to the login page even when no one is signed in', async () => {
    const agent = request.agent(app.getHttpServer() as Server);
    await agent.post('/logout').expect(302).expect('Location', '/login');
  });
});
