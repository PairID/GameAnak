// tests/challenger_m4_stress.mjs
// Adversarial Empirical Challenge Suite for Milestone 4 (PWA Offline Infrastructure & Selfcheck Runner)
// Zero external dependencies - executable via `node tests/challenger_m4_stress.mjs`

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

async function challenge(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    testResults.push({ name, status: 'PASS' });
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    testResults.push({ name, status: 'FAIL', error: err.message });
    console.error(`  ✖ [FAIL] ${name}: ${err.message}`);
  }
}

console.log('================================================================');
console.log('⚡ CHALLENGER M4: EMPIRICAL ADVERSARIAL STRESS TEST SUITE');
console.log('Evaluating sw.js, manifest.webmanifest, and selfcheck.mjs');
console.log('================================================================\n');

// ============================================================================
// SUITE 1: OFFLINE CACHE URL COVERAGE & CONSISTENCY AUDIT
// ============================================================================
console.log('[Suite 1: Offline Cache URL Coverage & Asset Audit]');

const swPath = path.join(ROOT_DIR, 'sw.js');
const manifestPath = path.join(ROOT_DIR, 'manifest.webmanifest');
const indexPath = path.join(ROOT_DIR, 'index.html');
const stylePath = path.join(ROOT_DIR, 'style.css');

const swContent = fs.readFileSync(swPath, 'utf8');
const manifestContent = fs.readFileSync(manifestPath, 'utf8');
const indexContent = fs.readFileSync(indexPath, 'utf8');
const styleContent = fs.readFileSync(stylePath, 'utf8');

// Extract ASSETS_TO_CACHE array from sw.js
function extractPreCacheList(code) {
  const match = code.match(/const\s+ASSETS_TO_CACHE\s*=\s*\[([\s\S]*?)\];/);
  if (!match) throw new Error('Could not find ASSETS_TO_CACHE in sw.js');
  return match[1]
    .split(',')
    .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

const preCacheAssets = extractPreCacheList(swContent);

await challenge('1.1 sw.js ASSETS_TO_CACHE parsing & non-emptiness', () => {
  assert(Array.isArray(preCacheAssets), 'preCacheAssets must be an array');
  assert(preCacheAssets.length >= 10, `preCacheAssets must have >= 10 assets, got ${preCacheAssets.length}`);
});

await challenge('1.2 Every referenced asset in index.html is present in sw.js ASSETS_TO_CACHE', () => {
  // Extract all href and src attributes from index.html
  const linkMatches = [...indexContent.matchAll(/<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
  const scriptMatches = [...indexContent.matchAll(/<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
  const imgMatches = [...indexContent.matchAll(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);

  const referencedInHtml = [...new Set([...linkMatches, ...scriptMatches, ...imgMatches])];

  // Helper to normalize relative paths for matching (e.g. "style.css" vs "./style.css")
  const normalize = (p) => p.replace(/^\.\//, '');

  const normalizedCacheList = preCacheAssets.map(normalize);

  const missingFromCache = [];
  for (const ref of referencedInHtml) {
    // Ignore external URLs or inline data URIs if any
    if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('data:')) {
      continue;
    }
    const normRef = normalize(ref);
    if (!normalizedCacheList.includes(normRef)) {
      missingFromCache.push(ref);
    }
  }

  assert.strictEqual(
    missingFromCache.length,
    0,
    `index.html references assets not in sw.js ASSETS_TO_CACHE: ${missingFromCache.join(', ')}`
  );
});

await challenge('1.3 Every file declared in ASSETS_TO_CACHE physically exists and is non-empty', () => {
  for (const asset of preCacheAssets) {
    if (asset === './' || asset === '/') {
      // Root directory resolves to index.html in web servers
      assert(fs.existsSync(indexPath), 'Root index.html must exist');
      continue;
    }
    const normalizedRelative = asset.replace(/^\.\//, '');
    const fullPath = path.join(ROOT_DIR, normalizedRelative);
    assert(fs.existsSync(fullPath), `Pre-cache asset does not exist on disk: ${asset} -> ${fullPath}`);
    const stats = fs.statSync(fullPath);
    assert(stats.isFile(), `Pre-cache asset must be a file: ${asset}`);
    assert(stats.size > 0, `Pre-cache asset is empty (0 bytes): ${asset}`);
  }
});

await challenge('1.4 Zero external CDN or remote network leaks in production assets', () => {
  // Check index.html, style.css, sw.js, app.js, engines.js, levels.js, audio.js, mascot.js
  const filesToCheck = [
    'index.html',
    'style.css',
    'app.js',
    'engines.js',
    'levels.js',
    'audio.js',
    'mascot.js',
    'sw.js',
    'manifest.webmanifest'
  ];

  const remoteRegex = /(https?:\/\/(?!localhost|127\.0\.0\.1)[^\s"'>]+)/gi;

  for (const f of filesToCheck) {
    const content = fs.readFileSync(path.join(ROOT_DIR, f), 'utf8');
    // Note: XML namespaces like xmlns="http://www.w3.org/2000/svg" are allowed
    const lines = content.split('\n');
    lines.forEach((line, lineNum) => {
      if (line.includes('http://www.w3.org/2000/svg')) return; // Valid SVG namespace
      const matches = [...line.matchAll(remoteRegex)];
      for (const m of matches) {
        throw new Error(`Forbidden remote URL detected in ${f}:${lineNum + 1}: ${m[1]}`);
      }
    });
  }
});

await challenge('1.5 All manifest icons are included in sw.js pre-cache list', () => {
  const manifest = JSON.parse(manifestContent);
  const normalize = (p) => p.replace(/^\.\//, '');
  const normalizedCacheList = preCacheAssets.map(normalize);

  for (const icon of manifest.icons) {
    const normIcon = normalize(icon.src);
    assert(
      normalizedCacheList.includes(normIcon),
      `Manifest icon ${icon.src} is missing from sw.js ASSETS_TO_CACHE`
    );
  }
});

// ============================================================================
// SUITE 2: SERVICE WORKER EXECUTION & FETCH HANDLER SIMULATION
// ============================================================================
console.log('\n[Suite 2: Service Worker Execution & Fetch Handler Simulation]');

// Construct a high-fidelity mock ServiceWorkerGlobalScope
function createMockServiceWorkerScope() {
  const listeners = {};
  const cacheStorage = new Map(); // cacheName -> Map(url, Response)

  class MockResponse {
    constructor(body = '', options = {}) {
      this.body = body;
      this.status = options.status || 200;
      this.statusText = options.statusText || 'OK';
      this.headers = new Map(Object.entries(options.headers || {}));
      this.type = options.type || 'basic';
      this.url = options.url || '';
    }
    clone() {
      return new MockResponse(this.body, {
        status: this.status,
        statusText: this.statusText,
        headers: Object.fromEntries(this.headers),
        type: this.type,
        url: this.url
      });
    }
  }

  class MockCache {
    constructor(name) {
      this.name = name;
      this.entries = new Map();
    }
    async add(request) {
      const url = typeof request === 'string' ? request : request.url;
      this.entries.set(url, new MockResponse(`Content of ${url}`, { url, status: 200, type: 'basic' }));
    }
    async addAll(requests) {
      for (const req of requests) {
        await this.add(req);
      }
    }
    async match(request) {
      const url = typeof request === 'string' ? request : request.url;
      const res = this.entries.get(url);
      return res ? res.clone() : undefined;
    }
    async put(request, response) {
      const url = typeof request === 'string' ? request : request.url;
      this.entries.set(url, response.clone());
    }
    async delete(request) {
      const url = typeof request === 'string' ? request : request.url;
      return this.entries.delete(url);
    }
  }

  const mockCaches = {
    async open(cacheName) {
      if (!cacheStorage.has(cacheName)) {
        cacheStorage.set(cacheName, new MockCache(cacheName));
      }
      return cacheStorage.get(cacheName);
    },
    async match(request) {
      const url = typeof request === 'string' ? request : request.url;
      for (const cache of cacheStorage.values()) {
        const match = await cache.match(url);
        if (match) return match;
      }
      return undefined;
    },
    async keys() {
      return Array.from(cacheStorage.keys());
    },
    async delete(cacheName) {
      return cacheStorage.delete(cacheName);
    },
    _storage: cacheStorage
  };

  let skipWaitingCalled = false;
  let claimCalled = false;

  const mockSelf = {
    addEventListener(event, fn) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
    },
    async skipWaiting() {
      skipWaitingCalled = true;
    },
    clients: {
      async claim() {
        claimCalled = true;
      }
    }
  };

  const mockFetch = async (request) => {
    // Default mock network fetch behavior
    return new MockResponse(`Network response for ${request.url || request}`, {
      status: 200,
      type: 'basic',
      url: typeof request === 'string' ? request : request.url
    });
  };

  return {
    listeners,
    mockCaches,
    mockSelf,
    mockFetch,
    MockResponse,
    get skipWaitingCalled() { return skipWaitingCalled; },
    get claimCalled() { return claimCalled; }
  };
}

// Helper to execute sw.js in the mock sandbox
function loadServiceWorker(scopeOverrides = {}) {
  const baseScope = createMockServiceWorkerScope();
  const context = {
    self: baseScope.mockSelf,
    caches: baseScope.mockCaches,
    fetch: scopeOverrides.fetch || baseScope.mockFetch,
    console: {
      log: () => {},
      warn: () => {},
      error: () => {}
    },
    Promise,
    Array,
    Object,
    String,
    Map
  };

  vm.createContext(context);
  vm.runInContext(swContent, context);

  baseScope.fetch = context.fetch;
  baseScope.context = context;
  return baseScope;
}

await challenge('2.1 sw.js installs cleanly and pre-caches all assets with skipWaiting', async () => {
  const sw = loadServiceWorker();
  const installListeners = sw.listeners['install'];
  assert(installListeners && installListeners.length > 0, 'sw.js must register install event listener');

  let waitUntilPromise = null;
  const mockInstallEvent = {
    waitUntil(promise) {
      waitUntilPromise = promise;
    }
  };

  installListeners[0](mockInstallEvent);
  assert(waitUntilPromise, 'install event must call event.waitUntil()');

  await waitUntilPromise;

  assert.strictEqual(sw.skipWaitingCalled, true, 'sw.js install must call self.skipWaiting()');

  // Verify that cache 'spidey-cilik-v1' exists and contains all assets
  const cache = await sw.mockCaches.open('spidey-cilik-v1');
  for (const asset of preCacheAssets) {
    const matched = await cache.match(asset);
    assert(matched, `Asset ${asset} was not pre-cached during install`);
  }
});

await challenge('2.2 sw.js activate handler removes old caches and claims clients', async () => {
  const sw = loadServiceWorker();

  // Create an old legacy cache and the current cache
  const oldCache = await sw.mockCaches.open('spidey-cilik-v0-legacy');
  await oldCache.put('old.js', new sw.MockResponse('old'));
  const currentCache = await sw.mockCaches.open('spidey-cilik-v1');
  await currentCache.put('app.js', new sw.MockResponse('app'));

  const activateListeners = sw.listeners['activate'];
  assert(activateListeners && activateListeners.length > 0, 'sw.js must register activate event listener');

  let waitUntilPromise = null;
  const mockActivateEvent = {
    waitUntil(promise) {
      waitUntilPromise = promise;
    }
  };

  activateListeners[0](mockActivateEvent);
  assert(waitUntilPromise, 'activate event must call event.waitUntil()');

  await waitUntilPromise;

  assert.strictEqual(sw.claimCalled, true, 'sw.js activate must call self.clients.claim()');

  const remainingKeys = await sw.mockCaches.keys();
  assert(!remainingKeys.includes('spidey-cilik-v0-legacy'), 'Old legacy cache must be purged on activate');
  assert(remainingKeys.includes('spidey-cilik-v1'), 'Current cache must be preserved');
});

await challenge('2.3 sw.js fetch handler returns cache hit immediately without network fetch', async () => {
  let networkFetchCalled = false;
  const sw = loadServiceWorker({
    fetch: async () => {
      networkFetchCalled = true;
      throw new Error('Network should NOT be contacted on cache hit');
    }
  });

  // Pre-seed cache
  const cache = await sw.mockCaches.open('spidey-cilik-v1');
  await cache.put('./app.js', new sw.MockResponse('Cached app.js code', { status: 200 }));

  const fetchListeners = sw.listeners['fetch'];
  assert(fetchListeners && fetchListeners.length > 0, 'sw.js must register fetch event listener');

  let responsePromise = null;
  const mockFetchEvent = {
    request: {
      url: './app.js',
      method: 'GET',
      mode: 'cors'
    },
    respondWith(promise) {
      responsePromise = promise;
    }
  };

  fetchListeners[0](mockFetchEvent);
  assert(responsePromise, 'fetch handler must call respondWith');

  const response = await responsePromise;
  assert.strictEqual(response.body, 'Cached app.js code', 'Must return cached response body');
  assert.strictEqual(networkFetchCalled, false, 'Network fetch was triggered on cache hit');
});

await challenge('2.4 sw.js fetch handler falls back to network on cache miss & dynamically caches valid 200 response', async () => {
  let networkFetchUrl = null;
  const sw = loadServiceWorker({
    fetch: async (req) => {
      networkFetchUrl = req.url;
      return new sw.MockResponse('Dynamic asset content', {
        status: 200,
        type: 'basic',
        url: req.url
      });
    }
  });

  const fetchListeners = sw.listeners['fetch'];
  let responsePromise = null;
  const mockFetchEvent = {
    request: {
      url: './new-asset.json',
      method: 'GET',
      mode: 'cors'
    },
    respondWith(promise) {
      responsePromise = promise;
    }
  };

  fetchListeners[0](mockFetchEvent);
  const response = await responsePromise;

  assert.strictEqual(networkFetchUrl, './new-asset.json', 'Network fetch should be called with request URL');
  assert.strictEqual(response.body, 'Dynamic asset content');

  // Allow promise tick for background cache.put
  await new Promise(r => setTimeout(r, 10));

  // Verify dynamic asset was cached in spidey-cilik-v1
  const cache = await sw.mockCaches.open('spidey-cilik-v1');
  const cachedDynamic = await cache.match('./new-asset.json');
  assert(cachedDynamic, 'New asset must be dynamically saved to cache');
  assert.strictEqual(cachedDynamic.body, 'Dynamic asset content');
});

await challenge('2.5 sw.js fetch handler bypasses non-GET requests', async () => {
  const sw = loadServiceWorker();
  const fetchListeners = sw.listeners['fetch'];

  let respondWithCalled = false;
  const mockPostEvent = {
    request: {
      url: './api/log',
      method: 'POST'
    },
    respondWith() {
      respondWithCalled = true;
    }
  };

  fetchListeners[0](mockPostEvent);
  assert.strictEqual(respondWithCalled, false, 'POST requests must not be handled by respondWith');
});

await challenge('2.6 sw.js offline navigation fallback serves ./index.html when network fails', async () => {
  const sw = loadServiceWorker({
    fetch: async () => {
      throw new Error('Network failure (offline)');
    }
  });

  // Pre-seed index.html in cache
  const cache = await sw.mockCaches.open('spidey-cilik-v1');
  await cache.put('./index.html', new sw.MockResponse('<html>SPA SHELL</html>', { status: 200 }));

  const fetchListeners = sw.listeners['fetch'];
  let responsePromise = null;
  const mockNavEvent = {
    request: {
      url: './level/3',
      method: 'GET',
      mode: 'navigate'
    },
    respondWith(promise) {
      responsePromise = promise;
    }
  };

  fetchListeners[0](mockNavEvent);
  assert(responsePromise, 'respondWith must be called');

  const response = await responsePromise;
  assert(response, 'Response must be returned for offline navigation fallback');
  assert.strictEqual(response.body, '<html>SPA SHELL</html>', 'Offline navigation must serve index.html');
});

// ============================================================================
// SUITE 3: STRICT W3C WEB APP MANIFEST CONFORMANCE
// ============================================================================
console.log('\n[Suite 3: Strict W3C Web App Manifest Conformance]');

let manifestJson;

await challenge('3.1 manifest.webmanifest parses as valid JSON', () => {
  assert.doesNotThrow(() => {
    manifestJson = JSON.parse(manifestContent);
  });
});

await challenge('3.2 Manifest identity and display fields conformance', () => {
  assert.strictEqual(typeof manifestJson.id, 'string', 'manifest.id must be string');
  assert.strictEqual(typeof manifestJson.name, 'string', 'manifest.name must be string');
  assert(manifestJson.name.length > 5, 'manifest.name must not be empty');
  assert.strictEqual(typeof manifestJson.short_name, 'string', 'manifest.short_name must be string');
  assert(manifestJson.short_name.length <= 15, `short_name '${manifestJson.short_name}' is concise for home screen`);

  const validDisplays = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
  assert(validDisplays.includes(manifestJson.display), `display '${manifestJson.display}' must be valid W3C display mode`);
  assert.strictEqual(manifestJson.display, 'standalone', 'PWA display must be standalone');

  const validOrientations = ['any', 'natural', 'landscape', 'portrait', 'portrait-primary', 'portrait-secondary', 'landscape-primary', 'landscape-secondary'];
  assert(validOrientations.includes(manifestJson.orientation), `orientation '${manifestJson.orientation}' must be valid`);

  assert.strictEqual(manifestJson.start_url, './index.html', 'start_url must point to ./index.html');
  assert.strictEqual(manifestJson.scope, './', 'scope must be ./');
});

await challenge('3.3 Manifest color formatting valid CSS Hex / RGB', () => {
  const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  assert(hexColorRegex.test(manifestJson.theme_color), `theme_color '${manifestJson.theme_color}' must be valid hex`);
  assert(hexColorRegex.test(manifestJson.background_color), `background_color '${manifestJson.background_color}' must be valid hex`);
  assert.strictEqual(manifestJson.theme_color.toUpperCase(), '#EF4444', 'theme_color matches Spidey Red');
  assert.strictEqual(manifestJson.background_color.toUpperCase(), '#FFF9F0', 'background_color matches Warm Canvas');
});

await challenge('3.4 Manifest icons declare both "any" and "maskable" purposes and sizes >= 192, 512', () => {
  assert(Array.isArray(manifestJson.icons), 'icons must be an array');
  assert(manifestJson.icons.length >= 4, `icons array must contain >= 4 icons, got ${manifestJson.icons.length}`);

  let has192 = false;
  let has512 = false;
  let hasMaskable = false;

  for (const icon of manifestJson.icons) {
    assert(typeof icon.src === 'string', 'icon.src must be string');
    assert(typeof icon.sizes === 'string', 'icon.sizes must be string');
    assert(typeof icon.type === 'string', 'icon.type must be string');

    if (icon.sizes.includes('192x192')) has192 = true;
    if (icon.sizes.includes('512x512')) has512 = true;
    if (icon.purpose && icon.purpose.includes('maskable')) hasMaskable = true;

    // Check physical file
    const physicalPath = path.join(ROOT_DIR, icon.src);
    assert(fs.existsSync(physicalPath), `Icon file missing on disk: ${icon.src}`);
  }

  assert(has192, 'Manifest must provide a 192x192 icon for mobile launcher');
  assert(has512, 'Manifest must provide a 512x512 icon for splash screen');
  assert(hasMaskable, 'Manifest must provide a maskable icon for adaptive Android icons');
});

await challenge('3.5 Physical SVG icon files validity and structure', () => {
  for (const icon of manifestJson.icons) {
    const physicalPath = path.join(ROOT_DIR, icon.src);
    const svgData = fs.readFileSync(physicalPath, 'utf8');

    assert(svgData.includes('<svg'), `Icon ${icon.src} must contain <svg tag`);
    assert(svgData.includes('</svg>'), `Icon ${icon.src} must contain </svg> closing tag`);
    assert(svgData.includes('xmlns="http://www.w3.org/2000/svg"'), `Icon ${icon.src} must declare SVG namespace`);
    assert(svgData.includes('viewBox='), `Icon ${icon.src} must declare viewBox for scalable rendering`);
  }
});

// ============================================================================
// SUITE 4: REAL BROWSER INTEGRATION AUDIT (SERVICE WORKER REGISTRATION)
// ============================================================================
console.log('\n[Suite 4: Real Browser Integration & Registration Audit]');

await challenge('4.1 index.html declares link rel="manifest" matching manifest.webmanifest', () => {
  const manifestLinkRegex = /<link\s+[^>]*rel=["']manifest["'][^>]*href=["']([^"']+)["'][^>]*>/i;
  const match = indexContent.match(manifestLinkRegex);
  assert(match, 'index.html must contain <link rel="manifest">');
  assert.strictEqual(match[1], 'manifest.webmanifest', 'manifest link href must be "manifest.webmanifest"');
});

await challenge('4.2 index.html declares mobile PWA meta tags (viewport, theme-color, apple-touch-icon)', () => {
  assert(indexContent.includes('<meta name="theme-color" content="#EF4444">'), 'theme-color meta tag missing or mismatch');
  assert(indexContent.includes('apple-touch-icon'), 'apple-touch-icon link missing');
  assert(indexContent.includes('viewport-fit=cover'), 'viewport-fit=cover missing from viewport meta');
});

await challenge('4.3 Real Service Worker Registration in index.html or app.js', () => {
  // A production PWA cannot function offline unless navigator.serviceWorker.register('sw.js')
  // is executed by either the HTML shell or the main application module.
  const appContent = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');

  const swRegRegex = /navigator\.serviceWorker\.register\s*\(\s*['"]([^'"]+)['"]/i;
  const inHtml = indexContent.match(swRegRegex);
  const inApp = appContent.match(swRegRegex);

  const registered = Boolean(inHtml || inApp);
  if (!registered) {
    throw new Error(
      'DEFECT DETECTED: Neither index.html nor app.js registers sw.js via navigator.serviceWorker.register(). ' +
      'In a real browser, sw.js will NEVER be registered, installed, or active, breaking offline capability!'
    );
  }
});

// ============================================================================
// SUITE 5: SELFCHECK RUNNER VERIFICATION & MUTATION SENSITIVITY
// ============================================================================
console.log('\n[Suite 5: Selfcheck Runner Integrity & Mutation Sensitivity]');

await challenge('5.1 selfcheck.mjs runs cleanly and passes all tests (oracle baseline)', async () => {
  const { execSync } = await import('node:child_process');
  const result = execSync('node selfcheck.mjs', { cwd: ROOT_DIR, encoding: 'utf8' });
  assert(result.includes('ALL SELF-CHECK VERIFICATIONS PASSED CLEANLY'), 'selfcheck.mjs must pass cleanly');
});

await challenge('5.2 selfcheck.mjs is sensitive to missing manifest properties (mutation test)', async () => {
  const { spawnSync } = await import('node:child_process');
  // Temporarily mutate manifest.webmanifest
  const backup = fs.readFileSync(manifestPath, 'utf8');
  try {
    const mutated = JSON.parse(backup);
    delete mutated.display; // Remove display
    fs.writeFileSync(manifestPath, JSON.stringify(mutated, null, 2), 'utf8');

    const run = spawnSync('node', ['selfcheck.mjs'], { cwd: ROOT_DIR, encoding: 'utf8' });
    assert.notStrictEqual(run.status, 0, 'selfcheck.mjs must FAIL when manifest.display is removed');
  } finally {
    // Revert mutation
    fs.writeFileSync(manifestPath, backup, 'utf8');
  }
});

await challenge('5.3 selfcheck.mjs is sensitive to corrupted sw.js cache list (mutation test)', async () => {
  const { spawnSync } = await import('node:child_process');
  const backup = fs.readFileSync(swPath, 'utf8');
  try {
    const mutated = backup.replace("'./engines.js',", ''); // Remove engines.js
    fs.writeFileSync(swPath, mutated, 'utf8');

    const run = spawnSync('node', ['selfcheck.mjs'], { cwd: ROOT_DIR, encoding: 'utf8' });
    assert.notStrictEqual(run.status, 0, 'selfcheck.mjs must FAIL when engines.js is omitted from sw.js');
  } finally {
    fs.writeFileSync(swPath, backup, 'utf8');
  }
});

// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log('\n================================================================');
console.log('📊 CHALLENGER M4 STRESS TEST EXECUTION SUMMARY');
console.log('================================================================');
console.log(`Total Adversarial Tests: ${totalTests}`);
console.log(`Passed:                  ${passedTests}`);
console.log(`Failed:                  ${failedTests}`);
console.log('================================================================');

if (failedTests > 0) {
  console.log('\n❌ EMPIRICAL DEFECTS IDENTIFIED:');
  testResults.filter(t => t.status === 'FAIL').forEach((t, i) => {
    console.log(`  ${i + 1}. [${t.name}]`);
    console.log(`     Error: ${t.error}`);
  });
  process.exit(1);
} else {
  console.log('\n✔ ALL EMPIRICAL CHALLENGES PASSED CLEANLY!\n');
  process.exit(0);
}
