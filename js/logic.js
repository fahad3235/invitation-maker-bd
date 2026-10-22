/* invitation-maker-bd \u2014 pure logic (no DOM). UMD: works in browser and Node.
   All user text is escaped at render time. No defaults are invented:
   the card shows exactly what the user typed, nothing more. */
(function (global) {
  'use strict';

  var TEMPLATES = [
    { id: 'wedding', nameEn: 'Wedding', nameBn: '\u09ac\u09bf\u09af\u09bc\u09c7', defaultStyle: 'gold' },
    { id: 'birthday', nameEn: 'Birthday', nameBn: '\u099c\u09a8\u09cd\u09ae\u09a6\u09bf\u09a8', defaultStyle: 'festive' },
    { id: 'eid', nameEn: 'Eid / Mehfil Gathering', nameBn: '\u0988\u09a6 / \u09ae\u09c7\u09b9\u09ab\u09bf\u09b2', defaultStyle: 'floral' },
    { id: 'graduation', nameEn: 'Graduation', nameBn: '\u09b8\u09cd\u09a8\u09be\u09a4\u0995', defaultStyle: 'minimal' },
    { id: 'business', nameEn: 'Business / Office Event', nameBn: '\u09ac\u09cd\u09af\u09ac\u09b8\u09be\u09af\u09bc\u09bf\u0995 \u0985\u09a8\u09c1\u09b7\u09cd\u09a0\u09be\u09a8', defaultStyle: 'minimal' }
  ];

  var STYLES = [
    { id: 'gold', nameEn: 'Classic Gold', nameBn: '\u0995\u09cd\u09b2\u09be\u09b8\u09bf\u0995 \u0997\u09cb\u09b2\u09cd\u09a1' },
    { id: 'floral', nameEn: 'Floral', nameBn: '\u09ab\u09cd\u09b2\u09cb\u09b0\u09be\u09b2' },
    { id: 'minimal', nameEn: 'Minimal', nameBn: '\u09ae\u09bf\u09a8\u09bf\u09ae\u09be\u09b2' },
    { id: 'festive', nameEn: 'Festive', nameBn: '\u0989\u09ce\u09b8\u09ac\u09ae\u09c1\u0996\u09b0' }
  ];

  var MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  var MONTHS_BN = ['\u099c\u09be\u09a8\u09c1\u09af\u09bc\u09be\u09b0\u09bf', '\u09ab\u09c7\u09ac\u09cd\u09b0\u09c1\u09af\u09bc\u09be\u09b0\u09bf', '\u09ae\u09be\u09b0\u09cd\u099a', '\u098f\u09aa\u09cd\u09b0\u09bf\u09b2', '\u09ae\u09c7', '\u099c\u09c1\u09a8',
    '\u099c\u09c1\u09b2\u09be\u0987', '\u0986\u0997\u09b8\u09cd\u099f', '\u09b8\u09c7\u09aa\u09cd\u099f\u09c7\u09ae\u09cd\u09ac\u09b0', '\u0985\u0995\u09cd\u099f\u09cb\u09ac\u09b0', '\u09a8\u09ad\u09c7\u09ae\u09cd\u09ac\u09b0', '\u09a1\u09bf\u09b8\u09c7\u09ae\u09cd\u09ac\u09b0'];

  var I18N = {
    en: {
      appTitle: 'Invitation Maker BD', appSub: 'Design beautiful event invitations \u2014 offline, in English or Bangla.',
      template: 'Template', style: 'Card style', hosts: 'Hosted by', honoree: 'Guest of honour (optional)',
      eventTitle: 'Event title', date: 'Date', time: 'Time (optional)', venue: 'Venue',
      dress: 'Dress code (optional)', rsvp: 'RSVP contact (optional)', message: 'Custom message (optional)',
      preview: 'Live preview', saveDraft: 'Save draft', copyText: 'Copy as text', printCard: 'Print card',
      exportBtn: 'Export JSON', importBtn: 'Import JSON', eraseBtn: 'Erase all', eraseConfirm: 'Type DELETE to erase all drafts',
      eraseGo: 'Erase', drafts: 'Saved drafts', noDrafts: 'No saved drafts yet. Fill the form and press Save draft.',
      load: 'Load', del: 'Delete', checkNote: 'Please check all details before sending \u2014 the card shows exactly what you typed.',
      copied: 'Copied to clipboard.', copyFail: 'Copy failed \u2014 select the text and copy it manually.',
      saved: 'Draft saved.', loaded: 'Draft loaded.', deleted: 'Draft deleted.',
      erased: 'All drafts erased.', importOk: 'Import successful.', importFail: 'Import failed: ',
      exportLabel: 'Exported JSON (copy it to keep a backup):', importLabel: 'Paste exported JSON here, then press Import JSON:',
      langBtn: 'Bangla', langBtnBn: 'English',
      req: 'Required', honoreeLabel: 'In honour of', dateLabel: 'Date', timeLabel: 'Time',
      venueLabel: 'Venue', dressLabel: 'Dress code', rsvpLabel: 'RSVP', hostsLabel: 'Hosted by',
      emptyPreview: 'Your invitation will appear here as you type.',
      printTitle: 'Invitation', validationTitle: 'Please fix:'
    },
    bn: {
      appTitle: '\u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3\u09aa\u09a4\u09cd\u09b0 \u09a8\u09bf\u09b0\u09cd\u09ae\u09be\u09a4\u09be', appSub: '\u09b8\u09c1\u09a8\u09cd\u09a6\u09b0 \u0985\u09a8\u09c1\u09b7\u09cd\u09a0\u09be\u09a8\u09c7\u09b0 \u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3\u09aa\u09a4\u09cd\u09b0 \u09ac\u09be\u09a8\u09be\u09a8 \u2014 \u0985\u09ab\u09b2\u09be\u0987\u09a8\u09c7, \u09ac\u09be\u0982\u09b2\u09be \u09ac\u09be \u0987\u0982\u09b0\u09c7\u099c\u09bf\u09a4\u09c7\u0964',
      template: '\u099f\u09c7\u09ae\u09aa\u09cd\u09b2\u09c7\u099f', style: '\u0995\u09be\u09b0\u09cd\u09a1\u09c7\u09b0 \u09b8\u09cd\u099f\u09be\u0987\u09b2', hosts: '\u0986\u09af\u09bc\u09cb\u099c\u0995', honoree: '\u09b8\u09ae\u09cd\u09ae\u09be\u09a8\u09bf\u09a4 \u0985\u09a4\u09bf\u09a5\u09bf (\u0990\u099a\u09cd\u099b\u09bf\u0995)',
      eventTitle: '\u0985\u09a8\u09c1\u09b7\u09cd\u09a0\u09be\u09a8\u09c7\u09b0 \u09a8\u09be\u09ae', date: '\u09a4\u09be\u09b0\u09bf\u0996', time: '\u09b8\u09ae\u09af\u09bc (\u0990\u099a\u09cd\u099b\u09bf\u0995)', venue: '\u09b8\u09cd\u09a5\u09be\u09a8',
      dress: '\u09aa\u09cb\u09b6\u09be\u0995 \u09ac\u09bf\u09a7\u09bf (\u0990\u099a\u09cd\u099b\u09bf\u0995)', rsvp: 'RSVP \u09af\u09cb\u0997\u09be\u09af\u09cb\u0997 (\u0990\u099a\u09cd\u099b\u09bf\u0995)', message: '\u09a8\u09bf\u099c\u09c7\u09b0 \u09ac\u09be\u09b0\u09cd\u09a4\u09be (\u0990\u099a\u09cd\u099b\u09bf\u0995)',
      preview: '\u09b2\u09be\u0987\u09ad \u09aa\u09cd\u09b0\u09bf\u09ad\u09bf\u0989', saveDraft: '\u0996\u09b8\u09a1\u09bc\u09be \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3', copyText: '\u099f\u09c7\u0995\u09cd\u09b8\u099f \u0995\u09aa\u09bf \u0995\u09b0\u09c1\u09a8', printCard: '\u0995\u09be\u09b0\u09cd\u09a1 \u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u0995\u09b0\u09c1\u09a8',
      exportBtn: 'JSON \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f', importBtn: 'JSON \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f', eraseBtn: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c1\u09a8', eraseConfirm: '\u09b8\u09ac \u09ae\u09c1\u099b\u09a4\u09c7 DELETE \u09b2\u09bf\u0996\u09c1\u09a8',
      eraseGo: '\u09ae\u09c1\u099b\u09c1\u09a8', drafts: '\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u0996\u09b8\u09a1\u09bc\u09be', noDrafts: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u0996\u09b8\u09a1\u09bc\u09be \u09a8\u09c7\u0987\u0964 \u09ab\u09b0\u09cd\u09ae \u09aa\u09c2\u09b0\u09a3 \u0995\u09b0\u09c7 \u0996\u09b8\u09a1\u09bc\u09be \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u099a\u09be\u09aa\u09c1\u09a8\u0964',
      load: '\u09b2\u09cb\u09a1', del: '\u09ae\u09c1\u099b\u09c1\u09a8', checkNote: '\u09aa\u09be\u09a0\u09be\u09a8\u09cb\u09b0 \u0986\u0997\u09c7 \u09b8\u09ac \u09a4\u09a5\u09cd\u09af \u09af\u09be\u099a\u09be\u0987 \u0995\u09b0\u09c1\u09a8 \u2014 \u0995\u09be\u09b0\u09cd\u09a1\u09c7 \u09a0\u09bf\u0995 \u0986\u09aa\u09a8\u09bf \u09af\u09be \u09b2\u09bf\u0996\u09c7\u099b\u09c7\u09a8 \u09a4\u09be\u0987 \u09a6\u09c7\u0996\u09be\u09ac\u09c7\u0964',
      copied: '\u0995\u09cd\u09b2\u09bf\u09aa\u09ac\u09cb\u09b0\u09cd\u09a1\u09c7 \u0995\u09aa\u09bf \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964', copyFail: '\u0995\u09aa\u09bf \u09b9\u09af\u09bc\u09a8\u09bf \u2014 \u099f\u09c7\u0995\u09cd\u09b8\u099f \u09b8\u09bf\u09b2\u09c7\u0995\u09cd\u099f \u0995\u09b0\u09c7 \u09a8\u09bf\u099c\u09c7 \u0995\u09aa\u09bf \u0995\u09b0\u09c1\u09a8\u0964',
      saved: '\u0996\u09b8\u09a1\u09bc\u09be \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4\u0964', loaded: '\u0996\u09b8\u09a1\u09bc\u09be \u09b2\u09cb\u09a1 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964', deleted: '\u0996\u09b8\u09a1\u09bc\u09be \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      erased: '\u09b8\u09ac \u0996\u09b8\u09a1\u09bc\u09be \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964', importOk: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09b8\u09ab\u09b2\u0964', importFail: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09ac\u09cd\u09af\u09b0\u09cd\u09a5: ',
      exportLabel: '\u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f \u0995\u09b0\u09be JSON (\u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u09b0\u09be\u0996\u09a4\u09c7 \u0995\u09aa\u09bf \u0995\u09b0\u09c1\u09a8):', importLabel: '\u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f \u0995\u09b0\u09be JSON \u098f\u0996\u09be\u09a8\u09c7 \u09aa\u09c7\u09b8\u09cd\u099f \u0995\u09b0\u09c1\u09a8, \u09a4\u09be\u09b0\u09aa\u09b0 JSON \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u099a\u09be\u09aa\u09c1\u09a8:',
      langBtn: 'Bangla', langBtnBn: 'English',
      req: '\u0986\u09ac\u09b6\u09cd\u09af\u0995', honoreeLabel: '\u09b8\u09ae\u09cd\u09ae\u09be\u09a8\u09c7', dateLabel: '\u09a4\u09be\u09b0\u09bf\u0996', timeLabel: '\u09b8\u09ae\u09af\u09bc',
      venueLabel: '\u09b8\u09cd\u09a5\u09be\u09a8', dressLabel: '\u09aa\u09cb\u09b6\u09be\u0995 \u09ac\u09bf\u09a7\u09bf', rsvpLabel: 'RSVP', hostsLabel: '\u0986\u09af\u09bc\u09cb\u099c\u0995',
      emptyPreview: '\u099f\u09be\u0987\u09aa \u0995\u09b0\u09be\u09b0 \u09b8\u09be\u09a5\u09c7 \u09b8\u09be\u09a5\u09c7 \u0986\u09aa\u09a8\u09be\u09b0 \u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3\u09aa\u09a4\u09cd\u09b0 \u098f\u0996\u09be\u09a8\u09c7 \u09a6\u09c7\u0996\u09be \u09af\u09be\u09ac\u09c7\u0964',
      printTitle: '\u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3\u09aa\u09a4\u09cd\u09b0', validationTitle: '\u09a0\u09bf\u0995 \u0995\u09b0\u09c1\u09a8:'
    }
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var BN_DIGITS = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];
  function toBnDigits(s) {
    return String(s).replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
  }

  function templateById(id) {
    for (var i = 0; i < TEMPLATES.length; i++) if (TEMPLATES[i].id === id) return TEMPLATES[i];
    return TEMPLATES[0];
  }
  function styleById(id) {
    for (var i = 0; i < STYLES.length; i++) if (STYLES[i].id === id) return STYLES[i];
    return STYLES[0];
  }

  function isValidDateStr(v) {
    if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
    var d = new Date(v + 'T00:00:00Z');
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }
  function isValidTimeStr(v) {
    if (v === '' || v == null) return true;
    return typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
  }

  function validateInvitation(f) {
    var errs = [];
    if (!f || typeof f !== 'object') return ['Invitation must be an object.'];
    if (!f.hosts || !String(f.hosts).trim()) errs.push('hosts required');
    else if (String(f.hosts).length > 120) errs.push('hosts max 120 chars');
    if (f.honoree != null && String(f.honoree).length > 120) errs.push('honoree max 120 chars');
    if (!f.title || !String(f.title).trim()) errs.push('title required');
    else if (String(f.title).length > 100) errs.push('title max 100 chars');
    if (!f.date || !isValidDateStr(f.date)) errs.push('date required (valid YYYY-MM-DD)');
    if (!isValidTimeStr(f.time)) errs.push('time must be HH:MM (24h)');
    if (!f.venue || !String(f.venue).trim()) errs.push('venue required');
    else if (String(f.venue).length > 200) errs.push('venue max 200 chars');
    if (f.dress != null && String(f.dress).length > 100) errs.push('dress max 100 chars');
    if (f.rsvp != null && String(f.rsvp).length > 120) errs.push('rsvp max 120 chars');
    if (f.message != null && String(f.message).length > 500) errs.push('message max 500 chars');
    if (f.template != null && !TEMPLATES.some(function (t) { return t.id === f.template; })) errs.push('unknown template');
    if (f.style != null && !STYLES.some(function (s) { return s.id === f.style; })) errs.push('unknown style');
    return errs;
  }

  function formatDate(iso, lang) {
    if (!isValidDateStr(iso)) return '';
    var parts = iso.split('-');
    var y = +parts[0], m = +parts[1], d = +parts[2];
    if (lang === 'bn') return toBnDigits(String(d)) + ' ' + MONTHS_BN[m - 1] + ' ' + toBnDigits(String(y));
    return String(d) + ' ' + MONTHS_EN[m - 1] + ' ' + String(y);
  }

  function formatTime(hhmm, lang) {
    if (!hhmm) return '';
    var p = hhmm.split(':');
    var h = +p[0], min = p[1];
    var ap = h < 12 ? 'AM' : 'PM';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    if (lang === 'bn') {
      var marker = h < 12 ? '\u09aa\u09c2\u09b0\u09cd\u09ac\u09be\u09b9\u09cd\u09a3' : '\u0985\u09aa\u09b0\u09be\u09b9\u09cd\u09a3';
      return toBnDigits(String(h12)) + ':' + toBnDigits(min) + ' ' + marker;
    }
    return h12 + ':' + min + ' ' + ap;
  }

  function buildCardText(inv, lang) {
    var t = I18N[lang] || I18N.en;
    var lines = [];
    lines.push((templateById(inv.template).nameEn && lang === 'bn' ? templateById(inv.template).nameBn : templateById(inv.template).nameEn));
    lines.push(String(inv.title || '').trim());
    lines.push(t.hostsLabel + ': ' + String(inv.hosts || '').trim());
    if (inv.honoree && String(inv.honoree).trim()) lines.push(t.honoreeLabel + ': ' + String(inv.honoree).trim());
    lines.push(t.dateLabel + ': ' + formatDate(inv.date, lang));
    if (inv.time) lines.push(t.timeLabel + ': ' + formatTime(inv.time, lang));
    lines.push(t.venueLabel + ': ' + String(inv.venue || '').trim());
    if (inv.dress && String(inv.dress).trim()) lines.push(t.dressLabel + ': ' + String(inv.dress).trim());
    if (inv.rsvp && String(inv.rsvp).trim()) lines.push(t.rsvpLabel + ': ' + String(inv.rsvp).trim());
    if (inv.message && String(inv.message).trim()) lines.push('', String(inv.message).trim());
    return lines.join('\n');
  }

  function buildCardHtml(inv, lang) {
    var t = I18N[lang] || I18N.en;
    var tpl = templateById(inv.template);
    var html = '';
    html += '<div class="card-template">' + esc(lang === 'bn' ? tpl.nameBn : tpl.nameEn) + '</div>';
    html += '<div class="card-title">' + esc(inv.title || '') + '</div>';
    html += '<div class="card-hosts">' + esc(t.hostsLabel) + ': ' + esc(inv.hosts || '') + '</div>';
    if (inv.honoree && String(inv.honoree).trim()) {
      html += '<div class="card-honoree">' + esc(t.honoreeLabel) + ': ' + esc(inv.honoree) + '</div>';
    }
    html += '<div class="card-divider"></div>';
    html += '<div class="card-row"><span>' + esc(t.dateLabel) + ':</span> ' + esc(formatDate(inv.date, lang)) + '</div>';
    if (inv.time) html += '<div class="card-row"><span>' + esc(t.timeLabel) + ':</span> ' + esc(formatTime(inv.time, lang)) + '</div>';
    html += '<div class="card-row"><span>' + esc(t.venueLabel) + ':</span> ' + esc(inv.venue || '') + '</div>';
    if (inv.dress && String(inv.dress).trim()) html += '<div class="card-row"><span>' + esc(t.dressLabel) + ':</span> ' + esc(inv.dress) + '</div>';
    if (inv.rsvp && String(inv.rsvp).trim()) html += '<div class="card-row"><span>' + esc(t.rsvpLabel) + ':</span> ' + esc(inv.rsvp) + '</div>';
    if (inv.message && String(inv.message).trim()) html += '<div class="card-message">' + esc(inv.message) + '</div>';
    return html;
  }

  function newDraftId() {
    return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function exportDrafts(drafts) {
    return JSON.stringify({ app: 'invitation-maker-bd', version: 1, exportedAt: new Date().toISOString(), drafts: drafts }, null, 2);
  }

  function importDrafts(text) {
    var data;
    try { data = JSON.parse(text); } catch (e) { return { ok: false, error: 'Not valid JSON.' }; }
    if (!data || data.app !== 'invitation-maker-bd' || data.version !== 1 || !Array.isArray(data.drafts)) {
      return { ok: false, error: 'Not an invitation-maker-bd export (app/version/drafts mismatch).' };
    }
    for (var i = 0; i < data.drafts.length; i++) {
      var d = data.drafts[i];
      if (!d || typeof d !== 'object' || typeof d.id !== 'string') return { ok: false, error: 'Draft #' + (i + 1) + ' is invalid.' };
      var errs = validateInvitation(d.fields || {});
      if (errs.length) return { ok: false, error: 'Draft #' + (i + 1) + ' invalid: ' + errs.join(', ') };
    }
    return { ok: true, drafts: data.drafts };
  }

  var api = {
    TEMPLATES: TEMPLATES, STYLES: STYLES, I18N: I18N,
    esc: esc, toBnDigits: toBnDigits, templateById: templateById, styleById: styleById,
    isValidDateStr: isValidDateStr, isValidTimeStr: isValidTimeStr,
    validateInvitation: validateInvitation, formatDate: formatDate, formatTime: formatTime,
    buildCardText: buildCardText, buildCardHtml: buildCardHtml,
    newDraftId: newDraftId, exportDrafts: exportDrafts, importDrafts: importDrafts
  };
  global.INV_LOGIC = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
