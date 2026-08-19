import session from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import type { RequestHandler } from 'express';

export async function buildSessionMiddleware(): Promise<RequestHandler> {
  const cookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  };

  if (process.env.NODE_ENV === 'test') {
    return session({
      name: 'sid',
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      store: new session.MemoryStore(),
      cookie,
    });
  }

  const client = createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });
  client.on('error', (error) => console.error('Redis error:', error));
  await client.connect();
  const store = new RedisStore({ client });
  return session({
    name: 'sid',
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store,
    cookie,
  });
}
