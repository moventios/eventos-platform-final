#!/usr/bin/env node
/**
 * Captures honest HTTP evidence for P1 auth/tenant flow against a running Next server.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRATCH = process.env['GROK_GOAL_SCRATCH'] ?? join(__dirname, '..', '.scratch');
const PORT = Number(process.env['EVENTOS_E2E_PORT'] ?? 3099);
const BASE = `http://127.0.0.1:${PORT}`;
const ACTOR_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

mkdirSync(SCRATCH, { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(timeoutMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/login`);
      if (res.ok) return;
    } catch {
      // not ready
    }
    await sleep(500);
  }
  throw new Error('Next server did not become ready in time');
}

async function main() {
  const webRoot = join(__dirname, '..');
  const serverLog = join(SCRATCH, 'server.log');
  writeFileSync(serverLog, '');
  const preload = join(webRoot, 'test/e2e-preload.mjs');

  const child = spawn('pnpm', ['start', '-p', String(PORT)], {
    cwd: webRoot,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      EVENTOS_E2E_CAPTURE: '1',
      TENANT_COOKIE_SECRET: process.env['TENANT_COOKIE_SECRET'] ?? 'capture-test-secret',
      NEXT_PUBLIC_APP_URL: BASE,
      NEXT_PUBLIC_SUPABASE_URL: 'http://capture.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'capture-anon-key',
      NODE_OPTIONS: `--import ${preload}`,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout?.on('data', (chunk) => appendFileSync(serverLog, chunk));
  child.stderr?.on('data', (chunk) => appendFileSync(serverLog, chunk));

  try {
    await waitForServer();

    const httpLog = [`=== HTTP capture ${new Date().toISOString()} ===`];

    const loginRes = await fetch(`${BASE}/login`);
    httpLog.push(`GET /login -> HTTP ${loginRes.status}`);

    const onboardingRes = await fetch(`${BASE}/onboarding`, { redirect: 'manual' });
    httpLog.push(`GET /onboarding (no session) -> HTTP ${onboardingRes.status}`);

    const provisionBody = {
      name: 'HTTP Capture Org',
      slug: 'http-capture-org',
      ownerEmail: 'http@capture.test',
      ownerDisplayName: 'HTTP Capture',
    };

    const provisionRes = await fetch(`${BASE}/api/v1/iam/tenants`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-e2e-actor-id': ACTOR_ID,
      },
      body: JSON.stringify(provisionBody),
    });

    const provisionJson = await provisionRes.json();
    const setCookie = provisionRes.headers.get('set-cookie') ?? '';

    const transcript = [
      '> POST /api/v1/iam/tenants HTTP/1.1',
      `> Host: 127.0.0.1:${PORT}`,
      `> x-e2e-actor-id: ${ACTOR_ID}`,
      '> Content-Type: application/json',
      '>',
      JSON.stringify(provisionBody),
      '',
      `< HTTP/1.1 ${provisionRes.status}${provisionRes.status === 201 ? ' Created' : ''}`,
      `< Content-Type: ${provisionRes.headers.get('content-type') ?? ''}`,
      `< Set-Cookie: ${setCookie || '(none)'}`,
      '<',
      JSON.stringify(provisionJson),
    ].join('\n');

    writeFileSync(join(SCRATCH, 'http-provision-post-transcript.txt'), transcript);
    writeFileSync(
      join(SCRATCH, 'http-provision-evidence.json'),
      JSON.stringify({ status: provisionRes.status, body: provisionJson, setCookie }, null, 2),
    );

    httpLog.push(`POST /api/v1/iam/tenants -> HTTP ${provisionRes.status}`);
    httpLog.push(`Set-Cookie present: ${setCookie.includes('eventos_tenant_id')}`);

    const cookiePair = setCookie.split(';')[0] ?? '';
    const authedHeaders = {
      ...(cookiePair ? { cookie: cookiePair } : {}),
      'x-e2e-actor-id': ACTOR_ID,
      'content-type': 'application/json',
    };

    const seedEventRes = await fetch(`${BASE}/api/v1/commerce/events`, {
      method: 'POST',
      headers: authedHeaders,
      body: JSON.stringify({ name: 'HTTP Capture Event', timezone: 'UTC' }),
    });
    const seedEventJson = await seedEventRes.json();
    httpLog.push(`POST /api/v1/commerce/events -> HTTP ${seedEventRes.status}`);

    const seedFacilityRes = await fetch(`${BASE}/api/v1/spatial/facilities`, {
      method: 'POST',
      headers: authedHeaders,
      body: JSON.stringify({ name: 'HTTP Capture Facility' }),
    });
    const seedFacilityJson = await seedFacilityRes.json();
    httpLog.push(`POST /api/v1/spatial/facilities -> HTTP ${seedFacilityRes.status}`);

    const eventsListRes = await fetch(`${BASE}/api/v1/commerce/events`, {
      headers: { cookie: cookiePair, 'x-e2e-actor-id': ACTOR_ID },
    });
    const eventsList = await eventsListRes.json();
    httpLog.push(`GET /api/v1/commerce/events -> HTTP ${eventsListRes.status} count=${eventsList.length}`);

    const dashboardRes = await fetch(`${BASE}/`, {
      headers: {
        ...(cookiePair ? { cookie: cookiePair } : {}),
        'x-e2e-actor-id': ACTOR_ID,
      },
      redirect: 'manual',
    });
    const dashboardHtml = await dashboardRes.text();
    writeFileSync(join(SCRATCH, 'dashboard-after-provision.html'), dashboardHtml);

    const eventsStat = dashboardHtml.match(
      /Total Events[\s\S]*?<p class="text-3xl font-bold">(\d+)<\/p>/,
    )?.[1];
    const facilitiesStat = dashboardHtml.match(
      /Total Facilities[\s\S]*?<p class="text-3xl font-bold">(\d+)<\/p>/,
    )?.[1];

    writeFileSync(
      join(SCRATCH, 'dashboard-capture-evidence.json'),
      JSON.stringify(
        {
          seedEvent: { status: seedEventRes.status, body: seedEventJson },
          seedFacility: { status: seedFacilityRes.status, body: seedFacilityJson },
          eventsList: { status: eventsListRes.status, count: eventsList.length },
          dashboard: {
            status: dashboardRes.status,
            eventsStat,
            facilitiesStat,
            hasOverview: dashboardHtml.includes('Overview'),
          },
        },
        null,
        2,
      ),
    );

    httpLog.push(`GET / (with tenant cookie + x-e2e-actor-id) -> HTTP ${dashboardRes.status}`);
    httpLog.push(`Dashboard contains Overview: ${dashboardHtml.includes('Overview')}`);
    httpLog.push(`Dashboard events stat: ${eventsStat ?? 'missing'}`);
    httpLog.push(`Dashboard facilities stat: ${facilitiesStat ?? 'missing'}`);

    writeFileSync(join(SCRATCH, 'http-check.log'), `${httpLog.join('\n')}\n`);

    if (provisionRes.status !== 201) {
      throw new Error(`Expected provision 201, got ${provisionRes.status}`);
    }
    if (!setCookie.includes('eventos_tenant_id')) {
      throw new Error('Provision response missing eventos_tenant_id Set-Cookie');
    }
    if (seedEventRes.status !== 201 || seedFacilityRes.status !== 201) {
      throw new Error('Failed to seed dashboard data via API');
    }
    if (!eventsListRes.ok || eventsList.length < 1) {
      throw new Error('Events API returned empty after seed');
    }
    if (!dashboardHtml.includes('Overview')) {
      throw new Error('Dashboard HTML missing Overview after provision');
    }
    if (eventsStat !== '1' || facilitiesStat !== '1') {
      throw new Error(
        `Dashboard stats not populated (events=${eventsStat}, facilities=${facilitiesStat})`,
      );
    }

    console.log('P1 HTTP evidence captured to', SCRATCH);
  } finally {
    child.kill('SIGTERM');
    await sleep(1000);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});