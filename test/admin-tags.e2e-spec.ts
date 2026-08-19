import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'node:http';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';

describe('Admin tags management page (e2e)', () => {
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
  });

  it('GET /admin/tags renders the tags management table', () => {
    return request(app.getHttpServer() as Server)
      .get('/admin/tags')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Tags/)
      .expect(/Merge/)
      .expect(/New tag/);
  });
});
