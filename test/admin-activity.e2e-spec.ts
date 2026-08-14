import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';

describe('Admin activity log page (e2e)', () => {
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

  it('GET /admin/activity renders the activity log', () => {
    return request(app.getHttpServer())
      .get('/admin/activity')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Activity/)
      .expect(/Admin actions only/)
      .expect(/registered/)
      .expect(/flagged a comment/);
  });
});
