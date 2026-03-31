import assert from 'node:assert/strict';
import request from 'supertest';
import { createTestContext, forceRateLimit, restoreAll, type StubRegistry } from '../setup';

describe('Portfolio Routes', () => {
  let app: any;
  let stubs: StubRegistry;

  beforeEach(async () => {
    ({ app, stubs } = await createTestContext());
  });

  afterEach(() => restoreAll(stubs));

  const validPayload = {
    site_name: 'Portfolio',
    site_role: 'Fullstack',
    site_url: 'https://example.com',
    site_image_url: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg',
    use_tech: ['Node', 'TS'],
    description: 'Project description',
  };

  it('GET /api/portfolio - success empty dataset', async () => {
    const res = await request(app).get('/api/portfolio');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, []);
  });

  it('GET /api/portfolio/:id - not found', async () => {
    const res = await request(app).get('/api/portfolio/missing-id');
    assert.equal(res.status, 404);
  });

  it('POST /api/portfolio - unauthorized then success', async () => {
    let res = await request(app).post('/api/portfolio').send(validPayload);
    assert.equal(res.status, 401);

    stubs.prisma.portfolio_item.create.resolves({ id: 'p-1', ...validPayload, created_at: new Date() });
    res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', 'Bearer access-ok')
      .send(validPayload);

    assert.equal(res.status, 201);
    assert.equal(stubs.prisma.portfolio_item.create.calledOnce, true);
  });

  it('POST /api/portfolio - validation failure and cloudinary cleanup', async () => {
    const res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', 'Bearer access-ok')
      .send({ ...validPayload, site_url: 'bad-url' });

    assert.equal(res.status, 400);
    assert.equal(stubs.deleteFromCloudinary.calledOnce, true);
  });

  it('PATCH /api/portfolio/:id - preconditions and success', async () => {
    let res = await request(app)
      .patch('/api/portfolio/p-1')
      .set('Authorization', 'Bearer access-ok')
      .send({ site_name: 'new' });
    assert.equal(res.status, 428);

    stubs.prisma.portfolio_item.findUnique.resolves({ id: 'p-1', ...validPayload });
    stubs.prisma.portfolio_item.update.resolves({ id: 'p-1', ...validPayload, site_name: 'updated' });

    res = await request(app)
      .patch('/api/portfolio/p-1')
      .set('Authorization', 'Bearer access-ok')
      .set('If-Match', 'etag-1')
      .send({ site_name: 'updated' });

    assert.equal(res.status, 200);
  });

  it('PATCH /api/portfolio/:id - invalid id / not found', async () => {
    stubs.prisma.portfolio_item.findUnique.resolves(null);
    const res = await request(app)
      .patch('/api/portfolio/invalid-id')
      .set('Authorization', 'Bearer access-ok')
      .set('If-Match', 'etag-1')
      .send({ site_name: 'updated' });

    assert.equal(res.status, 404);
  });

  it('DELETE /api/portfolio/:id - success and internal error', async () => {
    stubs.prisma.portfolio_item.findUnique.resolves({ id: 'p-1' });
    stubs.prisma.portfolio_item.delete.resolves({ id: 'p-1', site_image_url: validPayload.site_image_url });

    let res = await request(app)
      .delete('/api/portfolio/p-1')
      .set('Authorization', 'Bearer access-ok');
    assert.equal(res.status, 200);

    stubs.prisma.portfolio_item.findUnique.rejects(new Error('boom'));
    res = await request(app)
      .delete('/api/portfolio/p-1')
      .set('Authorization', 'Bearer access-ok');
    assert.equal(res.status, 500);
  });

  it('GET /api/portfolio - rate limited', async () => {
    forceRateLimit(stubs);
    const res = await request(app).get('/api/portfolio');
    assert.equal(res.status, 429);
  });
});
