#!/usr/bin/env node
// Dev QA helper: open a page in headless Chrome (local install, throwaway
// profile), collect console errors/warnings, wait for the 3D studio, save a
// screenshot. Not part of the site build.
//
//   node scripts/qa-shot.mjs --url http://127.0.0.1:5188/ --size 1440x900 --out shots/desktop.png
//   options: --reduced (prefers-reduced-motion), --wait 8000, --scroll 900, --full
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}

const url = arg('url', 'http://127.0.0.1:5188/');
const [width, height] = String(arg('size', '1440x900')).split('x').map(Number);
const out = arg('out', 'shots/shot.png');
const waitMs = Number(arg('wait', 9000));
const scrollY = Number(arg('scroll', 0));
const mobile = width < 768;

const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'b188-qa-'));
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  userDataDir,
  args: ['--no-first-run', '--no-default-browser-check', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
});

const logs = [];
try {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  if (arg('reduced', false)) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  page.on('console', (msg) => {
    if (['error', 'warn', 'warning'].includes(msg.type())) logs.push(`[console.${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (error) => logs.push(`[pageerror] ${error.message}`));
  page.on('requestfailed', (request) => logs.push(`[requestfailed] ${request.url()} ${request.failure()?.errorText}`));
  page.on('response', (response) => {
    if (response.status() >= 400) logs.push(`[http ${response.status()}] ${response.url()}`);
  });

  const early = arg('early', null);
  if (early !== null) {
    // Capture a moment right after load (e.g. the intro door mid-lift).
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise((r) => setTimeout(r, Number(early)));
    await fs.mkdir(path.dirname(out), { recursive: true });
    await page.screenshot({ path: out });
    console.log(JSON.stringify({ out, early: Number(early) }));
    await browser.close();
    process.exit(0);
  }
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  if (mobile) await page.mouse.wheel({ deltaY: 1 }).catch(() => {}); // phones load 3D on first interaction
  if (scrollY) await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  const to = arg('to', null);
  if (typeof to === 'string') {
    // Jump to an element (e.g. "#layanan-salon-body") and let the scene react.
    await page.waitForSelector('[data-studio-ready="true"]', { timeout: waitMs }).catch(() => {});
    await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: 'center' }), to);
    await new Promise((r) => setTimeout(r, Number(arg('settle', 3500))));
  }
  const tabs = Number(arg('tab', 0));
  for (let i = 0; i < tabs; i++) await page.keyboard.press('Tab');
  const ready = await page
    .waitForSelector('[data-studio-ready="true"]', { timeout: waitMs })
    .then(() => true)
    .catch(() => false);
  await new Promise((r) => setTimeout(r, 900));

  if (arg('full', false)) {
    // Walk the page once so lazy images load and scroll reveals fire.
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(window.innerHeight * 0.6)) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 160));
      }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 700));
  }
  await fs.mkdir(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out, fullPage: Boolean(arg('full', false)) });
  const info = await page.evaluate(() => ({
    intro: document.documentElement.dataset.intro,
    canvas: Boolean(document.querySelector('canvas')),
    scrollHeight: document.documentElement.scrollHeight,
  }));
  console.log(JSON.stringify({ out, width, height, studioReady: ready, ...info }));
  const script = arg('eval', null);
  if (typeof script === 'string') console.log('eval:', JSON.stringify(await page.evaluate(script), null, 1));
} finally {
  await browser.close();
  await fs.rm(userDataDir, { recursive: true, force: true }).catch(() => {});
}
console.log(logs.length ? logs.join('\n') : 'console: clean');
