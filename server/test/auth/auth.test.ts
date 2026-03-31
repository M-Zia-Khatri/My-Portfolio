import assert from 'node:assert/strict';
import request from 'supertest';
import { createTestContext, forceRateLimit, restoreAll, type StubRegistry } from '../setup';

describe('Auth Routes', () => {
  let app: any;
  let stubs: StubRegistry;

  beforeEach(async () => {
    ({ app, stubs } = await createTestContext());
  });

  afterEach(() => restoreAll(stubs));

  it('POST /api/auth/login - success', async () => {
    stubs.prisma.admin.findUnique.resolves({
      id: 'admin-1',
      email: 'admin@example.com',
      fullName: 'Admin User',
      passwordHash: '$2b$10$x',
      isActive: true,
    });

    const bcrypt = await import('bcrypt');
    stubs.sandbox.stub(bcrypt, 'compare').resolves(true as never);

    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'secret',
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(stubs.generateOtp.calledOnce, true);
    assert.equal(stubs.sendOtpEmail.calledOnce, true);
  });

  it('POST /api/auth/login - validation error', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: '' });
    assert.equal(res.status, 400);
    assert.equal(res.body.message, 'Validation error');
  });

  it('POST /api/auth/verify-otp - success', async () => {
    stubs.prisma.admin.findUnique.resolves({ id: 'admin-1', email: 'admin@example.com', isActive: true });
    const res = await request(app).post('/api/auth/verify-otp').send({ email: 'admin@example.com', otp: '123456' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.accessToken, 'access-token');
    assert.match(String(res.headers['set-cookie']), /refreshToken/);
  });

  it('POST /api/auth/verify-otp - invalid otp', async () => {
    stubs.prisma.admin.findUnique.resolves({ id: 'admin-1', email: 'admin@example.com', isActive: true });
    stubs.verifyOtp.resolves(false);
    const res = await request(app).post('/api/auth/verify-otp').send({ email: 'admin@example.com', otp: '000000' });
    assert.equal(res.status, 401);
  });

  it('POST /api/auth/refresh - expired token', async () => {
    stubs.rotateRefreshToken.resolves(null);
    const res = await request(app).post('/api/auth/refresh').set('Cookie', ['refreshToken=bad-token']);
    assert.equal(res.status, 401);
  });

  it('POST /api/auth/logout-all - unauthorized and expired token middleware', async () => {
    let res = await request(app).post('/api/auth/logout-all');
    assert.equal(res.status, 401);

    res = await request(app)
      .post('/api/auth/logout-all')
      .set('Authorization', 'Bearer expired-token');
    assert.equal(res.status, 401);
    assert.equal(res.body.message, 'Access token expired');
  });

  it('POST /api/auth/logout-all - invalid token type (forbidden-like case)', async () => {
    const res = await request(app)
      .post('/api/auth/logout-all')
      .set('Authorization', 'Bearer refresh-type');
    assert.equal(res.status, 401);
    assert.equal(res.body.message, 'Invalid token type');
  });

  it('GET /api/auth/me - success and not found', async () => {
    stubs.prisma.admin.findUnique.resolvesOnce({
      id: 'admin-1',
      email: 'admin@example.com',
      fullName: 'Admin',
      createdAt: new Date(),
    });

    const ok = await request(app).get('/api/auth/me').set('Authorization', 'Bearer access-ok');
    assert.equal(ok.status, 200);
    assert.equal(ok.body.data.role, 'admin');

    stubs.prisma.admin.findUnique.resolves(null);
    const missing = await request(app).get('/api/auth/me').set('Authorization', 'Bearer access-ok');
    assert.equal(missing.status, 404);
  });

  it('POST /api/auth/login - rate limit mocked', async () => {
    forceRateLimit(stubs);
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'secret' });
    assert.equal(res.status, 429);
  });
});
