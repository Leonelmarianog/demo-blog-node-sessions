import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';
import { resetDatabase } from './utils/db';
import { createAuthenticatedAgent } from './utils/authenticated-agent';

describe('Author dashboard page (e2e)', () => {
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

  it('GET /dashboard renders the author dashboard', async () => {
    const agent = await createAuthenticatedAgent(app);
    await agent
      .get('/dashboard')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Your posts/)
      .expect(/New post/)
      .expect(/Building a server-rendered blog/);
  });
});
