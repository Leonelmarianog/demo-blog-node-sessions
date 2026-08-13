import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';

describe('Tag topic page (e2e)', () => {
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

  it('GET /tag/:slug renders the tag topic page', () => {
    return request(app.getHttpServer())
      .get('/tag/nestjs')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/#nestjs/)
      .expect(/posts/)
      .expect(/Building a server-rendered blog/);
  });
});
