import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'node:http';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';
import { resetDatabase } from './utils/db';

describe('Register (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await setupApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    await resetDatabase();
  });

  it('registers a new account and redirects to the login page', async () => {
    const agent = request.agent(app.getHttpServer() as Server);
    await agent
      .post('/register')
      .send({
        username: 'morgan',
        email: 'morgan@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
      })
      .expect(302)
      .expect('Location', '/login');

    const follow = await agent.get('/login').expect(200);
    expect(follow.text).toMatch(/We sent a verification link/);
  });

  it('rejects a duplicate email', async () => {
    const agent = request.agent(app.getHttpServer() as Server);
    const payload = {
      username: 'morgan',
      email: 'morgan@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
    };
    await agent.post('/register').send(payload).expect(302);

    await agent
      .post('/register')
      .send({
        username: 'other',
        email: 'morgan@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
      })
      .expect(200)
      .expect(/Email already registered/);
  });

  it('re-renders the form with every field error at once', async () => {
    const res = await request(app.getHttpServer() as Server)
      .post('/register')
      .send({
        username: 'AB',
        email: 'not-an-email',
        password: 'weak',
        confirmPassword: 'other',
      })
      .expect(200);
    expect(res.text).toMatch(/Username must be 3 to 50/);
    expect(res.text).toMatch(/Email is not a valid/);
    expect(res.text).toMatch(/Password must be 8 to 128/);
    expect(res.text).toMatch(/Passwords do not match/);
    expect(res.text).toMatch(/value="AB"/);
  });
});
