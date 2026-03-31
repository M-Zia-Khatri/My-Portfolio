import sinon, { type SinonSandbox, type SinonStub } from 'sinon';

process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'test-access-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret';
process.env.NODE_ENV = 'test';

export type StubRegistry = {
  sandbox: SinonSandbox;
  prisma: any;
  redisEval: SinonStub;
  verifyAccessToken: SinonStub;
  signAccessToken: SinonStub;
  signRefreshToken: SinonStub;
  rotateRefreshToken: SinonStub;
  revokeRefreshToken: SinonStub;
  revokeAllRefreshTokens: SinonStub;
  generateOtp: SinonStub;
  verifyOtp: SinonStub;
  sendOtpEmail: SinonStub;
  sendContactEmail: SinonStub;
  deleteFromCloudinary: SinonStub;
};

export async function createTestContext() {
  const sandbox = sinon.createSandbox();

  const prismaModule = await import('../src/lib/prisma.ts');
  const redisModule = await import('../src/lib/utills/redis.ts');
  const jwtService = await import('../src/lib/services/jwt.service.ts');
  const otpService = await import('../src/lib/services/otp.service.ts');
  const mailer = await import('../src/lib/utills/mailer.ts');
  const cloudinary = await import('../src/lib/utills/cloudinary.ts');

  const prisma = prismaModule.default as any;

  const redisEval = sandbox.stub(redisModule.redis, 'eval').resolves([1, Date.now() / 1000]);

  const verifyAccessToken = sandbox.stub(jwtService, 'verifyAccessToken').callsFake((token: string) => {
    if (token === 'expired-token') {
      const err = new Error('jwt expired') as Error & { name: string };
      err.name = 'TokenExpiredError';
      throw err;
    }
    if (token === 'invalid-token') throw new Error('invalid');
    return {
      sub: 'admin-1',
      email: 'admin@example.com',
      type: token === 'refresh-type' ? 'refresh' : 'access',
    } as any;
  });

  const signAccessToken = sandbox.stub(jwtService, 'signAccessToken').returns('access-token');
  const signRefreshToken = sandbox.stub(jwtService, 'signRefreshToken').resolves('refresh-token-new');
  const rotateRefreshToken = sandbox
    .stub(jwtService, 'rotateRefreshToken')
    .resolves({ accessToken: 'rotated-access', refreshToken: 'rotated-refresh' });
  const revokeRefreshToken = sandbox.stub(jwtService, 'revokeRefreshToken').resolves();
  const revokeAllRefreshTokens = sandbox.stub(jwtService, 'revokeAllRefreshTokens').resolves();

  const generateOtp = sandbox.stub(otpService, 'generateOtp').resolves('123456');
  const verifyOtp = sandbox.stub(otpService, 'verifyOtp').resolves(true);

  const sendOtpEmail = sandbox.stub(mailer, 'sendOtpEmail').resolves();
  const sendContactEmail = sandbox.stub(mailer, 'sendContactEmail').resolves();
  const deleteFromCloudinary = sandbox.stub(cloudinary, 'deleteFromCloudinary').resolves({ result: 'ok' });

  sandbox.stub(prisma.admin, 'findUnique').resolves(null);

  sandbox.stub(prisma.contactMessage, 'create').resolves({ id: 'msg-1', created_at: new Date() });
  sandbox.stub(prisma.contactMessage, 'findMany').resolves([]);
  sandbox.stub(prisma.contactMessage, 'count').resolves(0);
  sandbox.stub(prisma.contactMessage, 'findUnique').resolves(null);
  sandbox.stub(prisma.contactMessage, 'delete').resolves({ id: 'msg-1' });

  sandbox.stub(prisma.portfolio_item, 'findMany').resolves([]);
  sandbox.stub(prisma.portfolio_item, 'findUnique').resolves(null);
  sandbox.stub(prisma.portfolio_item, 'create').resolves({ id: 'p-1' });
  sandbox.stub(prisma.portfolio_item, 'update').resolves({ id: 'p-1' });
  sandbox.stub(prisma.portfolio_item, 'delete').resolves({ id: 'p-1', site_image_url: null });

  sandbox.stub(prisma.skill, 'findMany').resolves([]);
  sandbox.stub(prisma.skill, 'findUnique').resolves(null);
  sandbox.stub(prisma.skill, 'create').resolves({ id: 's-1', created_at: new Date(), updated_at: new Date() });
  sandbox.stub(prisma.skill, 'update').resolves({ id: 's-1', created_at: new Date(), updated_at: new Date() });
  sandbox.stub(prisma.skill, 'delete').resolves({ id: 's-1' });

  const appModule = await import(`../src/app.ts?t=${Date.now()}`);

  const stubs: StubRegistry = {
    sandbox,
    prisma,
    redisEval,
    verifyAccessToken,
    signAccessToken,
    signRefreshToken,
    rotateRefreshToken,
    revokeRefreshToken,
    revokeAllRefreshTokens,
    generateOtp,
    verifyOtp,
    sendOtpEmail,
    sendContactEmail,
    deleteFromCloudinary,
  };

  return { app: appModule.default, stubs };
}

export function forceRateLimit(stubs: StubRegistry): void {
  stubs.redisEval.resolves([9_999, Date.now() / 1000]);
}

export function restoreAll(stubs: StubRegistry): void {
  stubs.sandbox.restore();
}
