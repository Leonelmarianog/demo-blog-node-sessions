import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'node:http';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';

describe('Auth pages (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /login renders the sign-in form', () => {
    return request(app.getHttpServer() as Server)
      .get('/login')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Sign in/)
      .expect(/Remember me/)
      .expect(/Forgot password/)
      .expect(/Create an account/);
  });

  it('GET /register renders the registration form', () => {
    return request(app.getHttpServer() as Server)
      .get('/register')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Create your account/)
      .expect(/Confirm password/)
      .expect(/Sign in/);
  });

  it('GET /forgot-password renders the reset request form', () => {
    return request(app.getHttpServer() as Server)
      .get('/forgot-password')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Reset your password/)
      .expect(/Send reset link/)
      .expect(/Back to sign in/);
  });

  it('GET /forgot-password/sent renders the email-sent confirmation', () => {
    return request(app.getHttpServer() as Server)
      .get('/forgot-password/sent')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Check your email/)
      .expect(/expir/)
      .expect(/Resend the link/);
  });

  it('GET /reset-password renders the set-new-password form', () => {
    return request(app.getHttpServer() as Server)
      .get('/reset-password')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Set a new password/)
      .expect(/Confirm new password/)
      .expect(/Reset password/);
  });
});
