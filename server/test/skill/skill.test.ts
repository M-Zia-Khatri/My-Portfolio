import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { createTestContext, forceRateLimit, restoreAll, type StubRegistry } from '../setup';

describe('Skill Routes', () => {
  let app: any;
  let stubs: StubRegistry;

  beforeEach(async () => {
    ({ app, stubs } = await createTestContext());
  });

  afterEach(() => restoreAll(stubs));

  const skillPayload = {
    name: 'TypeScript',
    icon: 'ts-icon',
    fileName: 'index.ts',
    lang: 'ts',
    color: '#3178c6',
    mode: 'code',
    code: ['const x = 1;'],
  };

  it('GET /api/skills - success empty and large payload query', async () => {
    const res = await request(app).get('/api/skills?mode=code&extra=' + 'a'.repeat(5000));
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, []);
  });

  it('GET /api/skills/:id - invalid id not found', async () => {
    const res = await request(app).get('/api/skills/not-exists');
    assert.equal(res.status, 404);
  });

  it('POST /api/skills - unauthorized and success', async () => {
    let res = await request(app).post('/api/skills').send(skillPayload);
    assert.equal(res.status, 401);

    stubs.prisma.skill.create.resolves({
      id: 's-1',
      name: 'TypeScript',
      icon: 'ts-icon',
      file_name: 'index.ts',
      lang: 'ts',
      color: '#3178c6',
      mode: 'code',
      code: ['const x = 1;'],
      commands: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res = await request(app)
      .post('/api/skills')
      .set('Authorization', 'Bearer access-ok')
      .send(skillPayload);
    assert.equal(res.status, 201);
  });

  it('POST /api/skills - duplicate entry conflict', async () => {
    const err: any = new Error('duplicate');
    err.code = 'P2002';
    err.meta = { target: ['lang'] };
    stubs.prisma.skill.create.rejects(err);

    const res = await request(app)
      .post('/api/skills')
      .set('Authorization', 'Bearer access-ok')
      .send(skillPayload);

    assert.equal(res.status, 409);
  });

  it('PATCH /api/skills/:id - missing if-match, not found and success', async () => {
    let res = await request(app)
      .patch('/api/skills/s-1')
      .set('Authorization', 'Bearer access-ok')
      .send({ name: 'Updated' });
    assert.equal(res.status, 428);

    stubs.prisma.skill.findUnique.resolves(null);
    res = await request(app)
      .patch('/api/skills/s-1')
      .set('Authorization', 'Bearer access-ok')
      .set('If-Match', 'etag-1')
      .send({ name: 'Updated' });
    assert.equal(res.status, 404);

    stubs.prisma.skill.findUnique.resolves({
      id: 's-1',
      name: 'TypeScript',
      icon: 'ts-icon',
      file_name: 'index.ts',
      lang: 'ts',
      color: '#3178c6',
      mode: 'code',
      code: ['const x = 1;'],
      commands: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    stubs.prisma.skill.update.resolves({
      id: 's-1',
      name: 'Updated',
      icon: 'ts-icon',
      file_name: 'index.ts',
      lang: 'ts',
      color: '#3178c6',
      mode: 'code',
      code: ['const x = 1;'],
      commands: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res = await request(app)
      .patch('/api/skills/s-1')
      .set('Authorization', 'Bearer access-ok')
      .set('If-Match', 'etag-1')
      .send({ name: 'Updated' });
    assert.equal(res.status, 200);
  });

  it('DELETE /api/skills/:id - not found and success', async () => {
    stubs.prisma.skill.findUnique.resolves(null);
    let res = await request(app)
      .delete('/api/skills/s-999')
      .set('Authorization', 'Bearer access-ok');
    assert.equal(res.status, 404);

    stubs.prisma.skill.findUnique.resolves({ id: 's-1' });
    res = await request(app).delete('/api/skills/s-1').set('Authorization', 'Bearer access-ok');
    assert.equal(res.status, 200);
  });

  it('GET /api/skills - rate limit mocked', async () => {
    forceRateLimit(stubs);
    const res = await request(app).get('/api/skills');
    assert.equal(res.status, 429);
  });
});
