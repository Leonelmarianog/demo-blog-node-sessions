import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';
import { resetDatabase } from './utils/db';
import { createAuthenticatedAgent } from './utils/authenticated-agent';

describe('Admin activity log page (e2e)', () => {
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

  it('GET /admin/activity renders the activity log', async () => {
    const agent = await createAuthenticatedAgent(app);
    await agent
      .get('/admin/activity')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Activity/)
      .expect(/Admin actions only/)
      .expect(/registered/)
      .expect(/flagged a comment/);
  });
});
