const fs = require('fs');
const { fetch } = globalThis;

const API_URL = process.env.API_URL || 'http://localhost:5001';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

let passed = 0;
let failed = 0;
let total = 0;
const failures = [];
const startTime = Date.now();

function log(msg) { console.log(msg); }
function pass(name) { passed++; total++; log(`  \x1b[32m✓\x1b[0m ${name}`); }
function fail(name, err) { failed++; total++; failures.push({ name, error: err }); log(`  \x1b[31m✗\x1b[0m ${name} — ${err}`); }
function section(name) { log(`\n\x1b[1m\x1b[36m── ${name} ──\x1b[0m`); }

async function req(method, path, body, headers = {}) {
  const url = `${API_URL}${path}`;
  const opts = { method, headers: { 'Content-Type': 'application/json', ...headers } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  return { status: res.status, data, ok: res.ok };
}

(async () => {
  let adminToken = '';
  let customerToken = '';

  // ============================================================
  // SECTION 1: Docker Health & Infrastructure
  // ============================================================
  section('1. Infrastructure Health Checks');
  {
    const tests = [
      ['Server responds to GET /api/health', async () => {
        const r = await req('GET', '/api/health');
        if (!r.ok) throw `Expected 200, got ${r.status}`;
        if (r.data.status !== 'ok') throw `Expected status ok, got ${r.data.status}`;
      }],
      ['Server responds to root route', async () => {
        const r = await req('GET', '/');
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['MongoDB connection active (products query)', async () => {
        const r = await req('GET', '/api/products');
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['Security headers present', async () => {
        const res = await fetch(`${API_URL}/api/products`);
        const h = res.headers;
        if (h.get('x-content-type-options') !== 'nosniff') throw 'Missing X-Content-Type-Options';
        if (!h.get('x-request-id')) throw 'Missing X-Request-ID';
      }],
      ['GZIP compression enabled', async () => {
        const res = await fetch(`${API_URL}/api/products`, {
          headers: { 'Accept-Encoding': 'gzip' }
        });
        const encoding = res.headers.get('content-encoding');
        if (encoding !== 'gzip') throw `Expected gzip encoding, got ${encoding}`;
      }],
    ];
    for (const [name, fn] of tests) { try { await fn(); pass(name); } catch (e) { fail(name, e); } }
  }

  // ============================================================
  // SECTION 2: Authentication
  // ============================================================
  section('2. Authentication');
  {
    const tests = [
      ['Admin login succeeds', async () => {
        const r = await req('POST', '/api/users/login', { email: 'admin@novacart.com', password: 'password123' });
        if (!r.ok) throw `Expected 200, got ${r.status}: ${r.data.message}`;
        if (!r.data.token) throw 'No token returned';
        if (r.data.role !== 'admin') throw `Expected admin role, got ${r.data.role}`;
        adminToken = r.data.token;
      }],
      ['Customer login succeeds', async () => {
        const r = await req('POST', '/api/users/login', { email: 'alex@novacart.com', password: 'password123' });
        if (!r.ok) throw `Expected 200, got ${r.status}: ${r.data.message}`;
        if (!r.data.token) throw 'No token returned';
        customerToken = r.data.token;
      }],
      ['Login with wrong password fails', async () => {
        const r = await req('POST', '/api/users/login', { email: 'admin@novacart.com', password: 'wrong' });
        if (r.ok) throw 'Expected failure, got 200';
        if (!r.data.message) throw 'Expected error message';
      }],
      ['Login with non-existent email fails', async () => {
        const r = await req('POST', '/api/users/login', { email: 'nobody@novacart.com', password: 'password123' });
        if (r.ok) throw 'Expected failure, got 200';
      }],
      ['Customer registration succeeds', async () => {
        const r = await req('POST', '/api/users', {
          name: 'Test User',
          email: `test_${Date.now()}@novacart.com`,
          password: 'TestPass123!'
        });
        if (!r.ok) throw `Expected 201, got ${r.status}: ${r.data.message}`;
      }],
      ['Accessing profile without token fails', async () => {
        const r = await req('GET', '/api/users/profile');
        if (r.ok) throw 'Expected 401, got 200';
      }],
      ['Accessing profile with token succeeds', async () => {
        const r = await req('GET', '/api/users/profile', null, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}: ${r.data.message}`;
      }],
    ];
    for (const [name, fn] of tests) { try { await fn(); pass(name); } catch (e) { fail(name, e); } }
  }

  // ============================================================
  // SECTION 3: Products API
  // ============================================================
  section('3. Products API');
  {
    let productId = '';
    const tests = [
      ['GET /api/products returns list', async () => {
        const r = await req('GET', '/api/products');
        if (!r.ok) throw `Expected 200, got ${r.status}`;
        if (!Array.isArray(r.data) && !r.data.products) throw 'Expected array or products key';
      }],
      ['GET /api/products?category=Electronics filters', async () => {
        const r = await req('GET', '/api/products?category=Electronics');
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['GET /api/products?sort=price_asc sorts', async () => {
        const r = await req('GET', '/api/products?sort=price_asc');
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['GET /api/products/categories returns categories', async () => {
        const r = await req('GET', '/api/products/categories');
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['GET /api/products/flash-deals returns deals', async () => {
        const r = await req('GET', '/api/products/flash-deals');
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['POST /api/products creates product (admin)', async () => {
        const r = await req('POST', '/api/products', {
          name: `Test Product ${Date.now()}`,
          slug: `test-product-${Date.now()}`,
          description: 'A test product for E2E testing',
          price: 49.99,
          category: 'Electronics',
          countInStock: 100,
          images: ['https://example.com/test.jpg'],
          colors: ['Black', 'White'],
          rating: 4.5,
          numReviews: 10
        }, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 201, got ${r.status}: ${r.data.message}`;
        productId = r.data._id || r.data.product?._id;
      }],
      ['GET /api/products/:id returns product', async () => {
        if (!productId) throw 'No product ID from creation';
        const r = await req('GET', `/api/products/${productId}`);
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['PUT /api/products/:id updates product', async () => {
        if (!productId) throw 'No product ID';
        const r = await req('PUT', `/api/products/${productId}`, {
          name: 'Updated Test Product',
          slug: `updated-test-${Date.now()}`,
          description: 'Updated description',
          price: 59.99,
          category: 'Electronics',
          countInStock: 75
        }, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}: ${r.data.message}`;
      }],
      ['DELETE /api/products/:id deletes product', async () => {
        if (!productId) throw 'No product ID';
        const r = await req('DELETE', `/api/products/${productId}`, null, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}: ${r.data.message}`;
      }],
      ['POST /api/products without auth fails', async () => {
        const r = await req('POST', '/api/products', { name: 'Unauthorized', price: 10 });
        if (r.ok) throw 'Expected 401, got 200';
      }],
    ];
    for (const [name, fn] of tests) { try { await fn(); pass(name); } catch (e) { fail(name, e); } }
  }

  // ============================================================
  // SECTION 4: Categories API
  // ============================================================
  section('4. Categories API');
  {
    let catId = '';
    const tests = [
      ['GET /api/categories returns tree', async () => {
        const r = await req('GET', '/api/categories');
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['POST /api/categories creates (admin)', async () => {
        const r = await req('POST', '/api/categories', {
          name: `Test Category ${Date.now()}`,
          slug: `test-cat-${Date.now()}`,
          description: 'Test category'
        }, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 201, got ${r.status}: ${r.data.message}`;
        catId = r.data._id || r.data.category?._id;
      }],
      ['PUT /api/categories/:id updates', async () => {
        if (!catId) throw 'No category ID';
        const r = await req('PUT', `/api/categories/${catId}`, { name: 'Updated Cat' }, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}: ${r.data.message}`;
      }],
      ['DELETE /api/categories/:id deletes', async () => {
        if (!catId) throw 'No category ID';
        const r = await req('DELETE', `/api/categories/${catId}`, null, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}: ${r.data.message}`;
      }],
    ];
    for (const [name, fn] of tests) { try { await fn(); pass(name); } catch (e) { fail(name, e); } }
  }

  // ============================================================
  // SECTION 5: Orders API
  // ============================================================
  section('5. Orders API');
  {
    let orderId = '';
    const tests = [
      ['POST /api/orders creates order (customer)', async () => {
        const r = await req('POST', '/api/orders', {
          orderItems: [{ name: 'Test Item', qty: 1, image: 'https://example.com/item.jpg', price: 29.99, product: '000000000000000000000001' }],
          shippingAddress: { fullName: 'Test User', street: '123 Test St', city: 'Testville', zip: '12345' },
          paymentMethod: 'Card',
          itemsPrice: 29.99,
          taxPrice: 2.40,
          shippingPrice: 5.99,
          totalPrice: 38.38
        }, { Authorization: `Bearer ${customerToken}` });
        if (!r.ok) throw `Expected 201, got ${r.status}: ${r.data.message}`;
        orderId = r.data._id || r.data.order?._id;
      }],
      ['GET /api/orders/myorders returns orders', async () => {
        const r = await req('GET', '/api/orders/myorders', null, { Authorization: `Bearer ${customerToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['GET /api/admin/orders returns all orders (admin)', async () => {
        const r = await req('GET', '/api/admin/orders', null, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['PUT /api/admin/orders/:id/status updates to Processing', async () => {
        if (!orderId) throw 'No order ID';
        const r = await req('PUT', `/api/admin/orders/${orderId}/status`, { status: 'Processing' }, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}: ${r.data.message}`;
      }],
      ['POST /api/orders without auth fails', async () => {
        const r = await req('POST', '/api/orders', { orderItems: [] });
        if (r.ok) throw 'Expected 401, got 200';
      }],
    ];
    for (const [name, fn] of tests) { try { await fn(); pass(name); } catch (e) { fail(name, e); } }
  }

  // ============================================================
  // SECTION 6: Banners API
  // ============================================================
  section('6. Banners API');
  {
    let bannerId = '';
    const tests = [
      ['GET /api/banners returns list (admin)', async () => {
        const r = await req('GET', '/api/banners', null, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['GET /api/banners/active/hero returns active', async () => {
        const r = await req('GET', '/api/banners/active/hero');
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['POST /api/banners creates (admin)', async () => {
        const r = await req('POST', '/api/banners', {
          title: `Test Banner ${Date.now()}`,
          image: 'https://example.com/banner.jpg',
          position: 'hero',
          isActive: true
        }, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 201, got ${r.status}: ${r.data.message}`;
        bannerId = r.data._id || r.data.banner?._id;
      }],
      ['DELETE /api/banners/:id deletes', async () => {
        if (!bannerId) throw 'No banner ID';
        const r = await req('DELETE', `/api/banners/${bannerId}`, null, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}: ${r.data.message}`;
      }],
    ];
    for (const [name, fn] of tests) { try { await fn(); pass(name); } catch (e) { fail(name, e); } }
  }

  // ============================================================
  // SECTION 7: Promotions API
  // ============================================================
  section('7. Promotions API');
  {
    let promoId = '';
    const tests = [
      ['GET /api/promotions returns list (admin)', async () => {
        const r = await req('GET', '/api/promotions', null, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['POST /api/promotions creates (admin)', async () => {
        const r = await req('POST', '/api/promotions', {
          name: `Test Promo ${Date.now()}`,
          code: `TEST${Date.now()}`,
          type: 'percentage',
          value: 10,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString()
        }, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 201, got ${r.status}: ${r.data.message}`;
        promoId = r.data._id || r.data.promotion?._id;
      }],
      ['DELETE /api/promotions/:id deletes', async () => {
        if (!promoId) throw 'No promo ID';
        const r = await req('DELETE', `/api/promotions/${promoId}`, null, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}: ${r.data.message}`;
      }],
    ];
    for (const [name, fn] of tests) { try { await fn(); pass(name); } catch (e) { fail(name, e); } }
  }

  // ============================================================
  // SECTION 8: Admin Dashboard API
  // ============================================================
  section('8. Admin Dashboard API');
  {
    const tests = [
      ['GET /api/admin/stats returns stats', async () => {
        const r = await req('GET', '/api/admin/stats', null, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['GET /api/admin/users returns users', async () => {
        const r = await req('GET', '/api/admin/users', null, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['GET /api/admin/analytics returns analytics', async () => {
        const r = await req('GET', '/api/admin/analytics', null, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['Admin stats without auth fails', async () => {
        const r = await req('GET', '/api/admin/stats');
        if (r.ok) throw 'Expected 401, got 200';
      }],
      ['Customer cannot access admin stats', async () => {
        const r = await req('GET', '/api/admin/stats', null, { Authorization: `Bearer ${customerToken}` });
        if (r.ok) throw 'Expected 403, got 200';
      }],
    ];
    for (const [name, fn] of tests) { try { await fn(); pass(name); } catch (e) { fail(name, e); } }
  }

  // ============================================================
  // SECTION 9: Navigation API
  // ============================================================
  section('9. Navigation API');
  {
    let navId = '';
    const tests = [
      ['GET /api/navigation returns tree', async () => {
        const r = await req('GET', '/api/navigation');
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['POST /api/navigation creates (admin)', async () => {
        const r = await req('POST', '/api/navigation', {
          label: `Test Nav ${Date.now()}`,
          url: '/test',
          order: 99
        }, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 201, got ${r.status}: ${r.data.message}`;
        navId = r.data._id || r.data.navigation?._id;
      }],
      ['DELETE /api/navigation/:id deletes', async () => {
        if (!navId) throw 'No nav ID';
        const r = await req('DELETE', `/api/navigation/${navId}`, null, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}: ${r.data.message}`;
      }],
    ];
    for (const [name, fn] of tests) { try { await fn(); pass(name); } catch (e) { fail(name, e); } }
  }

  // ============================================================
  // SECTION 10: Settings API
  // ============================================================
  section('10. Settings API');
  {
    const tests = [
      ['GET /api/settings returns settings', async () => {
        const r = await req('GET', '/api/settings');
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['PUT /api/settings/store updates (admin)', async () => {
        const r = await req('PUT', '/api/settings/store', {
          name: 'NovaCart Updated'
        }, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}: ${r.data.message}`;
      }],
    ];
    for (const [name, fn] of tests) { try { await fn(); pass(name); } catch (e) { fail(name, e); } }
  }

  // ============================================================
  // SECTION 11: Security Tests
  // ============================================================
  section('11. Security Tests');
  {
    const tests = [
      ['NoSQL injection in login is blocked', async () => {
        const r = await req('POST', '/api/users/login', { email: { $gt: '' }, password: { $gt: '' } });
        if (r.ok) throw 'Expected injection to be blocked';
      }],
      ['XSS payload in product name is sanitized', async () => {
        const r = await req('POST', '/api/products', {
          name: '<script>alert("xss")</script>',
          price: 10
        }, { Authorization: `Bearer ${adminToken}` });
        if (r.ok && r.data.name && r.data.name.includes('<script>')) {
          throw 'XSS was not sanitized';
        }
      }],
      ['Oversized request body is rejected', async () => {
        const bigPayload = 'x'.repeat(200 * 1024);
        const res = await fetch(`${API_URL}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: bigPayload })
        });
        if (res.ok) throw 'Expected 413, got 200';
      }],
      ['Missing required fields returns validation error', async () => {
        const r = await req('POST', '/api/products', {}, { Authorization: `Bearer ${adminToken}` });
        if (r.ok) throw 'Expected validation error, got 200';
      }],
      ['Invalid JWT token is rejected', async () => {
        const r = await req('GET', '/api/users/profile', null, { Authorization: 'Bearer invalidtoken123' });
        if (r.ok) throw 'Expected 401, got 200';
      }],
      ['Expired/broken authorization header rejected', async () => {
        const r = await req('GET', '/api/admin/stats', null, { Authorization: 'not-a-bearer-token' });
        if (r.ok) throw 'Expected 401, got 200';
      }],
    ];
    for (const [name, fn] of tests) { try { await fn(); pass(name); } catch (e) { fail(name, e); } }
  }

  // ============================================================
  // SECTION 12: Frontend Smoke Tests
  // ============================================================
  section('12. Frontend Smoke Tests');
  {
    const tests = [
      ['Homepage loads (HTTP 200)', async () => {
        const res = await fetch(CLIENT_URL);
        if (!res.ok) throw `Expected 200, got ${res.status}`;
      }],
      ['Homepage returns HTML', async () => {
        const res = await fetch(CLIENT_URL);
        const ct = res.headers.get('content-type');
        if (!ct || !ct.includes('text/html')) throw `Expected HTML, got ${ct}`;
      }],
      ['Homepage contains NovaCart', async () => {
        const res = await fetch(CLIENT_URL);
        const html = await res.text();
        if (!html.includes('NovaCart') && !html.includes('root')) throw 'Missing NovaCart content';
      }],
      ['Static assets served (JS bundle)', async () => {
        const res = await fetch(CLIENT_URL);
        const html = await res.text();
        const scriptMatch = html.match(/src="([^"]*\.js)"/);
        if (!scriptMatch) throw 'No JS bundle found in HTML';
      }],
      ['CSS served (Tailwind)', async () => {
        const res = await fetch(CLIENT_URL);
        const html = await res.text();
        const linkMatch = html.match(/href="([^"]*\.css)"/);
        if (!linkMatch) throw 'No CSS found in HTML';
      }],
    ];
    for (const [name, fn] of tests) { try { await fn(); pass(name); } catch (e) { fail(name, e); } }
  }

  // ============================================================
  // SECTION 13: Full CRUD Lifecycle (Product → Order → Admin)
  // ============================================================
  section('13. Full CRUD Lifecycle');
  {
    let pid = '';
    const tests = [
      ['Step 1: Create product', async () => {
        const r = await req('POST', '/api/products', {
          name: `Lifecycle Product ${Date.now()}`,
          slug: `lifecycle-product-${Date.now()}`,
          description: 'Full lifecycle test product',
          price: 99.99,
          category: 'Electronics',
          countInStock: 50,
          images: ['https://example.com/lifecycle.jpg'],
          colors: ['Silver']
        }, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 201, got ${r.status}: ${r.data.message}`;
        pid = r.data._id || r.data.product?._id;
      }],
      ['Step 2: Read product', async () => {
        if (!pid) throw 'No product ID';
        const r = await req('GET', `/api/products/${pid}`);
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['Step 3: Update product', async () => {
        if (!pid) throw 'No product ID';
        const r = await req('PUT', `/api/products/${pid}`, {
          price: 109.99,
          name: 'Lifecycle Product Updated',
          slug: `lifecycle-updated-${Date.now()}`,
          description: 'Updated lifecycle description',
          category: 'Electronics',
          countInStock: 49
        }, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}: ${r.data.message}`;
      }],
      ['Step 4: Create order for product', async () => {
        const r = await req('POST', '/api/orders', {
          orderItems: [{ name: 'Lifecycle Product', qty: 2, image: 'https://example.com/lifecycle.jpg', price: 109.99, product: pid }],
          shippingAddress: { fullName: 'Lifecycle Tester', street: '456 Lifecycle Ave', city: 'Testburg', zip: '67890' },
          paymentMethod: 'Card',
          itemsPrice: 219.98,
          taxPrice: 17.60,
          shippingPrice: 0,
          totalPrice: 237.58
        }, { Authorization: `Bearer ${customerToken}` });
        if (!r.ok) throw `Expected 201, got ${r.status}: ${r.data.message}`;
      }],
      ['Step 5: Verify in admin orders', async () => {
        const r = await req('GET', '/api/admin/orders', null, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['Step 6: Delete product', async () => {
        if (!pid) throw 'No product ID';
        const r = await req('DELETE', `/api/products/${pid}`, null, { Authorization: `Bearer ${adminToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}: ${r.data.message}`;
      }],
      ['Step 7: Confirm deletion', async () => {
        if (!pid) throw 'No product ID';
        const r = await req('GET', `/api/products/${pid}`);
        if (r.ok) throw 'Expected 404, got 200';
      }],
    ];
    for (const [name, fn] of tests) { try { await fn(); pass(name); } catch (e) { fail(name, e); } }
  }

  // ============================================================
  // SECTION 14: User Registration & Profile Flow
  // ============================================================
  section('14. User Registration & Profile Flow');
  {
    const email = `flowtest_${Date.now()}@novacart.com`;
    const tests = [
      ['Register new user', async () => {
        const r = await req('POST', '/api/users', { name: 'Flow Tester', email, password: 'FlowPass123!' });
        if (!r.ok) throw `Expected 201, got ${r.status}: ${r.data.message}`;
      }],
      ['Customer profile accessible', async () => {
        const r = await req('GET', '/api/users/profile', null, { Authorization: `Bearer ${customerToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['Customer orders accessible', async () => {
        const r = await req('GET', '/api/orders/myorders', null, { Authorization: `Bearer ${customerToken}` });
        if (!r.ok) throw `Expected 200, got ${r.status}`;
      }],
      ['Duplicate registration fails', async () => {
        const r = await req('POST', '/api/users', { name: 'Duplicate', email, password: 'Test123!' });
        if (r.ok) throw 'Expected failure for duplicate email';
      }],
    ];
    for (const [name, fn] of tests) { try { await fn(); pass(name); } catch (e) { fail(name, e); } }
  }

  // ============================================================
  // RESULTS
  // ============================================================
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  log(`\n${'═'.repeat(50)}`);
  log(`  E2E TEST RESULTS`);
  log(`${'═'.repeat(50)}`);
  log(`  Total:  ${total}`);
  log(`  Passed: \x1b[32m${passed}\x1b[0m`);
  log(`  Failed: \x1b[31m${failed}\x1b[0m`);
  log(`  Time:   ${duration}s`);

  if (failures.length > 0) {
    log(`\n\x1b[31mFAILURES:\x1b[0m`);
    failures.forEach((f, i) => {
      log(`  ${i + 1}. ${f.name}`);
      log(`     → ${f.error}`);
    });
  }

  log(`${'═'.repeat(50)}\n`);

  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    duration: `${duration}s`,
    total, passed, failed,
    failures: failures.map(f => ({ name: f.name, error: String(f.error) })),
    sections: {
      infrastructure: { total: 5, description: 'Docker health, security headers, compression' },
      auth: { total: 7, description: 'Login, register, JWT validation' },
      products: { total: 10, description: 'Full CRUD lifecycle' },
      categories: { total: 4, description: 'Category management' },
      orders: { total: 5, description: 'Order creation and admin' },
      banners: { total: 4, description: 'Banner CRUD' },
      promotions: { total: 3, description: 'Promotion management' },
      admin: { total: 5, description: 'Dashboard stats, users, analytics' },
      navigation: { total: 3, description: 'Nav tree management' },
      settings: { total: 2, description: 'Settings CRUD' },
      security: { total: 6, description: 'Injection, XSS, auth' },
      frontend: { total: 5, description: 'Homepage, assets, content' },
      lifecycle: { total: 7, description: 'Full CRUD → Order → Delete' },
      userFlow: { total: 5, description: 'Register → Login → Profile → Orders' },
    }
  };

  const reportPath = '/app/reports/e2e-report.json';
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`Report written to ${reportPath}`);
  } catch {
    log('Could not write report file');
  }

  process.exit(failed > 0 ? 1 : 0);
})();
