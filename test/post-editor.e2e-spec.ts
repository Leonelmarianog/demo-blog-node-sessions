import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'node:http';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';

describe('Post editor pages (e2e)', () => {
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

  it('GET /posts/new renders the create form', () => {
    return request(app.getHttpServer() as Server)
      .get('/posts/new')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/New post/)
      .expect(/Save draft/)
      .expect(/Publish/);
  });

  it('GET /posts/:slug/edit renders the edit form pre-filled', () => {
    return request(app.getHttpServer() as Server)
      .get('/posts/building-a-server-rendered-blog/edit')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Edit post/)
      .expect(/Building a server-rendered blog/)
      .expect(/Save changes/);
  });
});
