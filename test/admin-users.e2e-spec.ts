import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';

describe('Admin user management page (e2e)', () => {
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

  it('GET /admin/users renders the user management table', () => {
    return request(app.getHttpServer())
      .get('/admin/users')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Users/)
      .expect(/Joined/)
      .expect(/Self-deactivated/);
  });
});
