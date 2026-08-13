import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';

describe('Search results pages (e2e)', () => {
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

  it('GET /search/posts renders post results', () => {
    return request(app.getHttpServer())
      .get('/search/posts')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Posts/)
      .expect(/Tags/)
      .expect(/Building a server-rendered blog/);
  });

  it('GET /search/tags renders tag results', () => {
    return request(app.getHttpServer())
      .get('/search/tags')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Posts/)
      .expect(/Tags/)
      .expect(/#nestjs/)
      .expect(/#architecture/);
  });
});
