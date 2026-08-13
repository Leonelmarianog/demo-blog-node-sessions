import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';

describe('Settings pages (e2e)', () => {
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

  it('GET /settings/profile renders the profile settings', () => {
    return request(app.getHttpServer())
      .get('/settings/profile')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Settings/)
      .expect(/Profile/)
      .expect(/Account/)
      .expect(/Short bio/);
  });

  it('GET /settings/account renders the account settings', () => {
    return request(app.getHttpServer())
      .get('/settings/account')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Settings/)
      .expect(/Change password/)
      .expect(/Deactivate account/)
      .expect(/Delete account/);
  });
});
