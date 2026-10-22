/* invitation-maker-bd \u2014 node unit tests. Run: node tests/unit.test.js */
'use strict';
const L = require('../js/logic.js');
let pass = 0, fail = 0;
function eq(name, a, b) {
  if (a === b) pass++;
  else { fail++; console.log('FAIL', name, '| actual:', JSON.stringify(a), '| expected:', JSON.stringify(b)); }
}
function ok(name, c) { if (c) pass++; else { fail++; console.log('FAIL', name); } }

// Templates & styles
eq('5 templates', L.TEMPLATES.length, 5);
eq('template ids', L.TEMPLATES.map(t => t.id).join(','), 'wedding,birthday,eid,graduation,business');
eq('4 styles', L.STYLES.length, 4);
eq('style ids', L.STYLES.map(s => s.id).join(','), 'gold,floral,minimal,festive');
eq('wedding default style', L.templateById('wedding').defaultStyle, 'gold');
eq('unknown template falls back', L.templateById('nope').id, 'wedding');
eq('unknown style falls back', L.styleById('nope').id, 'gold');

// Validation
const good = { template: 'wedding', style: 'gold', hosts: 'Rahim & Karima', honoree: 'Ayesha & Tanvir',
  title: 'Wedding Reception', date: '2026-12-18', time: '19:30', venue: 'Dhaka Club',
  dress: 'Formal', rsvp: '01700-000000', message: 'Join us!' };
eq('valid invitation', L.validateInvitation(good).length, 0);
ok('missing hosts', L.validateInvitation({ ...good, hosts: '' }).includes('hosts required'));
ok('missing title', L.validateInvitation({ ...good, title: '  ' }).includes('title required'));
ok('missing venue', L.validateInvitation({ ...good, venue: '' }).includes('venue required'));
ok('bad date rejected', L.validateInvitation({ ...good, date: '2026-02-30' }).length > 0);
ok('bad date format rejected', L.validateInvitation({ ...good, date: '18/12/2026' }).length > 0);
ok('bad time rejected', L.validateInvitation({ ...good, time: '25:00' }).length > 0);
eq('empty time ok', L.validateInvitation({ ...good, time: '' }).length, 0);
ok('title too long', L.validateInvitation({ ...good, title: 'x'.repeat(101) }).length > 0);
ok('message too long', L.validateInvitation({ ...good, message: 'x'.repeat(501) }).length > 0);
ok('unknown template', L.validateInvitation({ ...good, template: 'x' }).length > 0);
ok('unknown style', L.validateInvitation({ ...good, style: 'x' }).length > 0);
ok('optional honoree empty ok', L.validateInvitation({ ...good, honoree: '' }).length === 0);
eq('null input', L.validateInvitation(null).length, 1);

// Date / time formatting
eq('date EN', L.formatDate('2026-12-18', 'en'), '18 December 2026');
eq('date BN digits+month', L.formatDate('2026-12-18', 'bn'), '\u09e7\u09ee \u09a1\u09bf\u09b8\u09c7\u09ae\u09cd\u09ac\u09b0 \u09e8\u09e6\u09e8\u09ec');
eq('date invalid', L.formatDate('2026-13-01', 'en'), '');
eq('date leap', L.formatDate('2024-02-29', 'en'), '29 February 2024');
eq('time EN pm', L.formatTime('19:30', 'en'), '7:30 PM');
eq('time EN am midnight', L.formatTime('00:15', 'en'), '12:15 AM');
eq('time EN noon', L.formatTime('12:00', 'en'), '12:00 PM');
eq('time BN', L.formatTime('19:30', 'bn'), '\u09ed:\u09e9\u09e6 \u0985\u09aa\u09b0\u09be\u09b9\u09cd\u09a3');
eq('time BN morning', L.formatTime('09:05', 'bn'), '\u09ef:\u09e6\u09eb \u09aa\u09c2\u09b0\u09cd\u09ac\u09be\u09b9\u09cd\u09a3');
eq('time empty', L.formatTime('', 'en'), '');
eq('bn digits', L.toBnDigits('2026'), '\u09e8\u09e6\u09e8\u09ec');
eq('bn digits mixed', L.toBnDigits('Room 12'), 'Room \u09e7\u09e8');

// Escaping \u2014 no HTML injection from user input
const evil = { ...good, hosts: '<script>alert(1)</script>', title: 'A & B "quoted"',
  message: "It's <b>bold</b>" };
const html = L.buildCardHtml(evil, 'en');
ok('script tag escaped', !html.includes('<script>') && html.includes('&lt;script&gt;'));
ok('amp escaped', html.includes('A &amp; B'));
ok('quote escaped', html.includes('&quot;quoted&quot;'));
ok('message escaped', html.includes('&lt;b&gt;bold&lt;/b&gt;'));
ok('card contains hosts text', html.includes('alert(1)'));
ok('optional fields render', html.includes('Dress code'));

// Card text (copy-as-text)
const text = L.buildCardText(good, 'en');
ok('text has title', text.includes('Wedding Reception'));
ok('text has hosts', text.includes('Hosted by: Rahim & Karima'));
ok('text has date', text.includes('Date: 18 December 2026'));
ok('text has time', text.includes('Time: 7:30 PM'));
ok('text has venue', text.includes('Venue: Dhaka Club'));
ok('text has message', text.includes('Join us!'));
const textNoOpt = L.buildCardText({ ...good, honoree: '', dress: '', rsvp: '', message: '', time: '' }, 'en');
ok('text omits empty honoree', !textNoOpt.includes('In honour of'));
ok('text omits empty dress', !textNoOpt.includes('Dress code'));
ok('text omits empty rsvp', !textNoOpt.includes('RSVP'));
ok('text omits empty time', !textNoOpt.includes('Time:'));
const textBn = L.buildCardText(good, 'bn');
ok('text BN date', textBn.includes('\u09e7\u09ee \u09a1\u09bf\u09b8\u09c7\u09ae\u09cd\u09ac\u09b0 \u09e8\u09e6\u09e8\u09ec'));
ok('text BN template', textBn.includes('\u09ac\u09bf\u09af\u09bc\u09c7'));

// Export / import round-trip + strictness
const drafts = [{ id: 'd1', fields: good, updatedAt: '2026-10-18T00:00:00.000Z' }];
const exported = L.exportDrafts(drafts);
ok('export has app marker', JSON.parse(exported).app === 'invitation-maker-bd');
const imp = L.importDrafts(exported);
eq('import round-trip ok', imp.ok, true);
eq('import keeps draft', imp.drafts.length, 1);
eq('import keeps title', imp.drafts[0].fields.title, 'Wedding Reception');
ok('import bad JSON', L.importDrafts('not json').ok === false);
ok('import wrong app', L.importDrafts(JSON.stringify({ app: 'other', version: 1, drafts: [] })).ok === false);
ok('import wrong version', L.importDrafts(JSON.stringify({ app: 'invitation-maker-bd', version: 2, drafts: [] })).ok === false);
ok('import drafts not array', L.importDrafts(JSON.stringify({ app: 'invitation-maker-bd', version: 1, drafts: {} })).ok === false);
ok('import invalid draft fields', L.importDrafts(JSON.stringify({ app: 'invitation-maker-bd', version: 1, drafts: [{ id: 'x', fields: { ...good, date: 'bad' } }] })).ok === false);
ok('import draft missing id', L.importDrafts(JSON.stringify({ app: 'invitation-maker-bd', version: 1, drafts: [{ fields: good }] })).ok === false);
ok('import XSS draft still escapes at render', (() => {
  const r = L.importDrafts(JSON.stringify({ app: 'invitation-maker-bd', version: 1, drafts: [{ id: 'x', fields: evil }] }));
  return r.ok && !L.buildCardHtml(r.drafts[0].fields, 'en').includes('<script>');
})());

// Draft ids unique
const ids = new Set(Array.from({ length: 50 }, () => L.newDraftId()));
eq('draft ids unique', ids.size, 50);

console.log(`unit: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
