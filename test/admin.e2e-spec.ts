import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';
import { resetDatabase } from './utils/db';
import { createAuthenticatedAgent } from './utils/authenticated-agent';

describe('Admin overview page (e2e)', () => {
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

  it('GET /admin renders the admin overview', async () => {
    const agent = await createAuthenticatedAgent(app);
    await agent
      .get('/admin')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Admin/)
      .expect(/Recent activity/)
      .expect(/Comments/);
  });
});
