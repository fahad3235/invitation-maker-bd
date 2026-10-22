/* invitation-maker-bd smoke tests \u2014 headless Chromium via puppeteer-core.
   Run: node tests/smoke.mjs */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let puppeteerMod;
try { puppeteerMod = require('puppeteer-core'); }
catch (e) { puppeteerMod = require('/home/hatch/workspace/muse-project-factory/builds/job-application-tracker-bd/node_modules/puppeteer-core'); }
const puppeteer = puppeteerMod.default || puppeteerMod;

const APP = 'file:///home/hatch/workspace/muse-project-factory/builds/invitation-maker-bd/index.html';
let pass = 0, fail = 0;
function eq(name, a, b) { if (a === b) pass++; else { fail++; console.log('FAIL', name, '| actual:', JSON.stringify(a), '| expected:', JSON.stringify(b)); } }
function ok(name, c) { if (c) pass++; else { fail++; console.log('FAIL', name); } }
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runViewport(width, label) {
  const browser = await puppeteer.launch({ executablePath: '/opt/meta-chromium/chrome', headless: 'new',
    args: ['--no-sandbox', '--no-proxy-server', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900 });
  const consoleErrors = [], pageErrors = [];
  let netRequests = 0;
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) netRequests++; });
  await page.goto(APP, { waitUntil: 'load' });
  await page.evaluate(() => window.localStorage.clear());
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.__IM_READY === true, { timeout: 8000 });

  eq(label + ' title', await page.$eval('#h-title', el => el.textContent.trim()), 'Invitation Maker BD');
  eq(label + ' lang button', await page.$eval('#langBtn', el => el.textContent.trim()), 'Bangla');
  ok(label + ' check note', (await page.$eval('#checkNote', el => el.textContent)).includes('check all details'));
  eq(label + ' 5 templates', await page.$$eval('#f-template option', els => els.length), 5);
  eq(label + ' 4 styles', await page.$$eval('#f-style option', els => els.length), 4);
  ok(label + ' empty preview shown', await page.evaluate(() => !document.getElementById('emptyPreview').hidden));
  ok(label + ' no drafts text', await page.evaluate(() => !document.getElementById('noDrafts').hidden));

  // Fill a full invitation (birthday) and check live preview
  await page.select('#f-template', 'birthday');
  await page.select('#f-style', 'festive');
  await page.$eval('#f-hosts', el => { el.value = 'The Karim Family'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.$eval('#f-honoree', el => { el.value = 'Mina'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.$eval('#f-title', el => { el.value = 'Mina Turns Ten'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.$eval('#f-date', el => { el.value = '2026-11-20'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.$eval('#f-time', el => { el.value = '18:00'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.$eval('#f-venue', el => { el.value = 'Gulshan Club'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.$eval('#f-dress', el => { el.value = 'Smart casual'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.$eval('#f-rsvp', el => { el.value = '01700-111111'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.$eval('#f-message', el => { el.value = 'Cake at seven!'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await sleep(200);
  const card = await page.$eval('#card', el => el.textContent);
  ok(label + ' preview has title', card.includes('Mina Turns Ten'));
  ok(label + ' preview has hosts', card.includes('The Karim Family'));
  ok(label + ' preview has honoree', card.includes('Mina'));
  ok(label + ' preview has date EN', card.includes('20 November 2026'));
  ok(label + ' preview has time', card.includes('6:00 PM'));
  ok(label + ' preview has venue', card.includes('Gulshan Club'));
  ok(label + ' preview has dress', card.includes('Smart casual'));
  ok(label + ' preview has rsvp', card.includes('01700-111111'));
  ok(label + ' preview has message', card.includes('Cake at seven!'));
  ok(label + ' festive class', await page.$eval('#card', el => el.className.includes('style-festive')));
  ok(label + ' empty preview hidden', await page.evaluate(() => document.getElementById('emptyPreview').hidden));

  // Style switch changes card class
  await page.select('#f-style', 'minimal');
  await sleep(100);
  ok(label + ' minimal class', await page.$eval('#card', el => el.className.includes('style-minimal')));

  // Save draft -> appears in list -> reload persists
  await page.click('#btnSave');
  await sleep(200);
  eq(label + ' draft count 1', await page.$$eval('#draftList li', els => els.length), 1);
  ok(label + ' draft shows title', (await page.$eval('#draftList', el => el.textContent)).includes('Mina Turns Ten'));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.__IM_READY === true, { timeout: 8000 });
  eq(label + ' draft persists after reload', await page.$$eval('#draftList li', els => els.length), 1);

  // Load draft into form
  await page.$eval('#f-title', el => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.click('[data-load]');
  await sleep(200);
  eq(label + ' load restores title', await page.$eval('#f-title', el => el.value), 'Mina Turns Ten');

  // Export contains the draft
  await page.click('#btnExport');
  await sleep(150);
  const exported = await page.$eval('#exportText', el => el.value);
  ok(label + ' export has app marker', exported.includes('invitation-maker-bd'));
  ok(label + ' export has draft', exported.includes('Mina Turns Ten'));

  // Import a second draft
  const second = JSON.stringify({ app: 'invitation-maker-bd', version: 1, drafts: [{ id: 'd-imported', fields: { template: 'eid', style: 'floral', hosts: 'Community Centre', honoree: '', title: 'Eid Gathering', date: '2026-04-01', time: '', venue: 'Community Hall', dress: '', rsvp: '', message: '' } }] });
  await page.$eval('#importText', (el, v) => { el.value = v; }, second);
  await page.click('#btnImport');
  await sleep(200);
  eq(label + ' import adds draft', await page.$$eval('#draftList li', els => els.length), 2);

  // Bad import rejected
  await page.$eval('#importText', el => { el.value = '{"app":"other"}'; });
  await page.click('#btnImport');
  await sleep(200);
  eq(label + ' bad import keeps count', await page.$$eval('#draftList li', els => els.length), 2);
  ok(label + ' bad import flash', (await page.$eval('#flash', el => el.textContent)).includes('Import failed'));

  // Validation: empty required fields block save
  await page.$eval('#f-hosts', el => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.$eval('#f-title', el => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.click('#btnSave');
  await sleep(200);
  ok(label + ' validation errors shown', await page.evaluate(() => !document.getElementById('formErrors').hidden));
  eq(label + ' invalid save keeps count', await page.$$eval('#draftList li', els => els.length), 2);

  // BN toggle: labels + Bengali digits in preview
  await page.$eval('#f-hosts', el => { el.value = 'The Karim Family'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.$eval('#f-title', el => { el.value = 'Mina Turns Ten'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.click('#langBtn');
  await sleep(200);
  eq(label + ' BN title', await page.$eval('#h-title', el => el.textContent.trim()), '\u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3\u09aa\u09a4\u09cd\u09b0 \u09a8\u09bf\u09b0\u09cd\u09ae\u09be\u09a4\u09be');
  const cardBn = await page.$eval('#card', el => el.textContent);
  ok(label + ' BN date digits', cardBn.includes('\u09e8\u09e6 \u09a8\u09ad\u09c7\u09ae\u09cd\u09ac\u09b0 \u09e8\u09e6\u09e8\u09ec'));
  ok(label + ' BN time', cardBn.includes('\u09ec:\u09e6\u09e6 \u0985\u09aa\u09b0\u09be\u09b9\u09cd\u09a3'));
  await page.click('#langBtn'); // back to EN
  await sleep(150);

  // Erase-all requires typed DELETE
  await page.$eval('#eraseInput', el => { el.value = 'nope'; });
  await page.click('#btnErase');
  await sleep(150);
  eq(label + ' wrong erase keeps drafts', await page.$$eval('#draftList li', els => els.length), 2);
  await page.$eval('#eraseInput', el => { el.value = 'DELETE'; });
  await page.click('#btnErase');
  await sleep(200);
  eq(label + ' erase clears drafts', await page.$$eval('#draftList li', els => els.length), 0);

  // XSS: hostile input is escaped, not executed
  await page.$eval('#f-hosts', el => { el.value = '<img src=x onerror=alert(1)>'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.$eval('#f-title', el => { el.value = 'XSS Test'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.$eval('#f-date', el => { el.value = '2026-11-20'; el.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.$eval('#f-venue', el => { el.value = 'Somewhere'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await sleep(150);
  ok(label + ' no img injected', (await page.$$eval('#card img', els => els.length)) === 0);
  ok(label + ' hostile text escaped', (await page.$eval('#card', el => el.innerHTML)).includes('&lt;img'));

  eq(label + ' console errors', consoleErrors.length, 0);
  eq(label + ' page errors', pageErrors.length, 0);
  eq(label + ' network requests', netRequests, 0);
  if (width === 390) {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= 390);
    ok(label + ' no horizontal overflow at 390px', overflow);
  }
  await browser.close();
}

await runViewport(1280, 'desktop');
await runViewport(390, 'mobile');
console.log(`smoke: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
