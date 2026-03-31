import assert from 'node:assert/strict';
import request from 'supertest';
import { createTestContext, forceRateLimit, restoreAll, type StubRegistry } from '../setup';

describe('Contact Routes', () => {
  let app: any;
  let stubs: StubRegistry;

  beforeEach(async () => {
    ({ app, stubs } = await createTestContext());
  });

  afterEach(() => restoreAll(stubs));

  it('POST /api/contact - success with persistence check', async () => {
    const res = await request(app).post('/api/contact').send({
      fullName: 'John Doe',
      email: 'john@example.com',
      message: 'Hello this is a real message',
    });

    assert.equal(res.status, 201);
    assert.equal(stubs.prisma.contactMessage.create.calledOnce, true);
    assert.equal(stubs.sendContactEmail.calledOnce, true);
  });

  it('POST /api/contact - validation middleware', async () => {
    const res = await request(app).post('/api/contact').send({
      fullName: 'J',
      email: 'bad-email',
      message: 'short',
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.message, 'Validation error');
  });

  it('GET /api/contact - unauthorized access', async () => {
    const res = await request(app).get('/api/contact');
    assert.equal(res.status, 401);
  });

  it('GET /api/contact - success + empty dataset', async () => {
    stubs.prisma.contactMessage.findMany.resolves([]);
    const res = await request(app).get('/api/contact').set('Authorization', 'Bearer access-ok');

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, []);
    assert.equal(res.body.meta.total, 0);
  });

  it('DELETE /api/contact/:id - not found and success', async () => {
    stubs.prisma.contactMessage.findUnique.resolves(null);
    const missing = await request(app)
      .delete('/api/contact/not-here')
      .set('Authorization', 'Bearer access-ok');
    assert.equal(missing.status, 404);

    stubs.prisma.contactMessage.findUnique.resolves({ id: 'msg-1' });
    const ok = await request(app)
      .delete('/api/contact/msg-1')
      .set('Authorization', 'Bearer access-ok');
    assert.equal(ok.status, 200);
  });

  it('GET /api/contact - internal server error simulation', async () => {
    stubs.prisma.contactMessage.findMany.rejects(new Error('db down'));
    const res = await request(app).get('/api/contact').set('Authorization', 'Bearer access-ok');
    assert.equal(res.status, 500);
  });

  it('POST /api/contact - rate limit mocked', async () => {
    forceRateLimit(stubs);
    const res = await request(app).post('/api/contact').send({
      fullName: 'John Doe',
      email: 'john@example.com',
      message: 'Hello this is a real message',
    });

    assert.equal(res.status, 429);
  });
});
