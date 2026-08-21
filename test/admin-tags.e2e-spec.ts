import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';
import { resetDatabase } from './utils/db';
import { createAuthenticatedAgent } from './utils/authenticated-agent';

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
    await resetDatabase();
  });

  it('GET /admin/tags renders the tags management table', async () => {
    const agent = await createAuthenticatedAgent(app);
    await agent
      .get('/admin/tags')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Tags/)
      .expect(/Merge/)
      .expect(/New tag/);
  });
});
