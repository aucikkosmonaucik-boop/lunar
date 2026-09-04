import { handleCors } from '../api/_lib/cors.js';
import ordersListHandler from '../api/_orders/list.js';
import ordersUpdateHandler from '../api/_orders/update.js';
import socialLoginHandler from '../api/_auth/social-login.js';
import productsHandler from '../api/products-handler.js';
import promosHandler from '../api/promos-handler.js';
import loyaltyHandler from '../api/loyalty-handler.js';

function createMockReqRes(options: {
  method: string;
  url?: string;
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: any;
}) {
  const req: any = {
    method: options.method,
    url: options.url || '/',
    headers: options.headers || {},
    query: options.query || {},
    body: options.body || {},
    socket: { remoteAddress: '127.0.0.1' },
  };

  let statusCode = 200;
  let responseData: any = null;
  const headersSet: Record<string, string> = {};

  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    setHeader(name: string, value: string) {
      headersSet[name.toLowerCase()] = value;
      return res;
    },
    json(data: any) {
      responseData = data;
      return res;
    },
    end() {
      return res;
    },
    getStatus: () => statusCode,
    getData: () => responseData,
    getHeaders: () => headersSet,
  };

  return { req, res };
}

async function runSecurityTests() {
  console.log('--- Starting Automated Security Checks ---');
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} - ${detail || ''}`);
      failed++;
    }
  }

  // 1. CORS Test: Malicious origin
  {
    const { req, res } = createMockReqRes({
      method: 'OPTIONS',
      headers: { origin: 'https://evil-hacker-site.com' },
    });
    handleCors(req, res);
    assert(
      'CORS blocks unauthorized origin from receiving credential reflection',
      res.getStatus() === 403 || res.getHeaders()['access-control-allow-origin'] !== 'https://evil-hacker-site.com'
    );
  }

  // 2. Orders list: Unauthenticated all=true
  {
    const { req, res } = createMockReqRes({
      method: 'GET',
      query: { all: 'true' },
    });
    await ordersListHandler(req, res);
    assert(
      'Orders List blocks unauthenticated GET all=true data dump',
      res.getStatus() === 403,
      `Status was: ${res.getStatus()}`
    );
  }

  // 3. Orders list: Tracking number without email
  {
    const { req, res } = createMockReqRes({
      method: 'GET',
      query: { trackingNumber: 'AN123456789IE' },
    });
    await ordersListHandler(req, res);
    assert(
      'Orders Tracking requires email to prevent order enumeration',
      res.getStatus() === 400,
      `Status was: ${res.getStatus()}`
    );
  }

  // 4. Social Login: Attack without valid third-party token
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        provider: 'google',
        email: 'admin@lunar.com',
        token: 'fake-invalid-token-123',
      },
    });
    await socialLoginHandler(req, res);
    assert(
      'Social Login rejects forged token or impersonation attempt',
      res.getStatus() === 401 || res.getStatus() === 403,
      `Status was: ${res.getStatus()}`
    );
  }

  // 5. Orders update: Non-admin attempt
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: { orderId: 'test-123', status: 'Delivered' },
    });
    await ordersUpdateHandler(req, res);
    assert(
      'Order Update requires Admin privileges',
      res.getStatus() === 403,
      `Status was: ${res.getStatus()}`
    );
  }

  // 6. Products management: Non-admin DELETE attempt
  {
    const { req, res } = createMockReqRes({
      method: 'DELETE',
      query: { id: 'prod-123' },
    });
    await productsHandler(req, res);
    assert(
      'Product DELETE requires Admin privileges',
      res.getStatus() === 403,
      `Status was: ${res.getStatus()}`
    );
  }

  // 7. Promos: Non-admin GET all codes attempt
  {
    const { req, res } = createMockReqRes({
      method: 'GET',
    });
    await promosHandler(req, res);
    assert(
      'Promos listing requires Admin privileges',
      res.getStatus() === 403,
      `Status was: ${res.getStatus()}`
    );
  }

  // 8. Loyalty: Non-admin points adjustment attempt
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      query: { action: 'admin-adjust' },
      body: { targetUserId: 'user-1', points: 99999 },
    });
    await loyaltyHandler(req, res);
    assert(
      'Loyalty Points adjustment requires Admin privileges',
      res.getStatus() === 403,
      `Status was: ${res.getStatus()}`
    );
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
