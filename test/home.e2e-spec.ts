import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'node:http';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';

describe('Home page (e2e)', () => {
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

  it('GET / renders the home feed', () => {
    return request(app.getHttpServer() as Server)
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Demo Blog/)
      .expect(/Latest posts/)
      .expect(/Building a server-rendered blog/);
  });
});
