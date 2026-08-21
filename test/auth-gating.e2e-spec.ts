import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'node:http';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';
import { resetDatabase } from './utils/db';
import { createAuthenticatedAgent } from './utils/authenticated-agent';

describe('Auth gating (e2e)', () => {
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

  function anonymous() {
    return request(app.getHttpServer() as Server);
  }

  describe('anonymous requests are redirected to /login', () => {
    it('GET /dashboard', async () => {
      await anonymous()
        .get('/dashboard')
        .expect(302)
        .expect('Location', '/login');
    });

    it('GET /posts/new', async () => {
      await anonymous()
        .get('/posts/new')
        .expect(302)
        .expect('Location', '/login');
    });

    it('GET /posts/:slug/edit', async () => {
      await anonymous()
        .get('/posts/building-a-server-rendered-blog/edit')
        .expect(302)
        .expect('Location', '/login');
    });

    it('GET /admin', async () => {
      await anonymous().get('/admin').expect(302).expect('Location', '/login');
    });

    it('GET /admin/posts', async () => {
      await anonymous()
        .get('/admin/posts')
        .expect(302)
        .expect('Location', '/login');
    });
  });

  describe('public routes stay open for anonymous users', () => {
    it('GET /', async () => {
      await anonymous().get('/').expect(200);
    });

    it('GET /posts/:slug', async () => {
      await anonymous()
        .get('/posts/building-a-server-rendered-blog')
        .expect(200);
    });

    it('GET /login', async () => {
      await anonymous().get('/login').expect(200);
    });
  });

  describe('signed-in users reach the protected routes', () => {
    it('GET /dashboard', async () => {
      const agent = await createAuthenticatedAgent(app);
      const res = await agent.get('/dashboard').expect(200);
      expect(res.text).toMatch(/Signed in as morgan/);
    });

    it('GET /posts/new', async () => {
      const agent = await createAuthenticatedAgent(app);
      await agent.get('/posts/new').expect(200);
    });

    it('GET /admin', async () => {
      const agent = await createAuthenticatedAgent(app);
      await agent.get('/admin').expect(200);
    });
  });
});
