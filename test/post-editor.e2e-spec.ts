import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { setupApp } from './utils/e2e-test.setup';
import { resetDatabase } from './utils/db';
import { createAuthenticatedAgent } from './utils/authenticated-agent';

describe('Post editor pages (e2e)', () => {
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

  it('GET /posts/new renders the create form', async () => {
    const agent = await createAuthenticatedAgent(app);
    await agent
      .get('/posts/new')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/New post/)
      .expect(/Save draft/)
      .expect(/Publish/);
  });

  it('GET /posts/:slug/edit renders the edit form pre-filled', async () => {
    const agent = await createAuthenticatedAgent(app);
    await agent
      .get('/posts/building-a-server-rendered-blog/edit')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Edit post/)
      .expect(/Building a server-rendered blog/)
      .expect(/Save changes/);
  });
});
