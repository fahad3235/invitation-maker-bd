/* invitation-maker-bd \u2014 DOM wiring. All rules live in logic.js. */
(function () {
  'use strict';
  var L = window.INV_LOGIC;
  var LS_KEY = 'invitation-maker-bd:v1';

  function $(id) { return document.getElementById(id); }
  function state() {
    try {
      var raw = window.localStorage.getItem(LS_KEY);
      if (raw) { var s = JSON.parse(raw); if (s && Array.isArray(s.drafts)) return s; }
    } catch (e) { /* corrupted storage -> fresh state */ }
    return { lang: 'en', drafts: [] };
  }
  function saveState(s) { window.localStorage.setItem(LS_KEY, JSON.stringify(s)); }
  var S = state();
  var lang = S.lang === 'bn' ? 'bn' : 'en';

  function t() { return L.I18N[lang]; }

  function readForm() {
    return {
      template: $('f-template').value,
      style: $('f-style').value,
      hosts: $('f-hosts').value,
      honoree: $('f-honoree').value,
      title: $('f-title').value,
      date: $('f-date').value,
      time: $('f-time').value,
      venue: $('f-venue').value,
      dress: $('f-dress').value,
      rsvp: $('f-rsvp').value,
      message: $('f-message').value
    };
  }
  function writeForm(f) {
    $('f-template').value = f.template || 'wedding';
    $('f-style').value = f.style || 'gold';
    $('f-hosts').value = f.hosts || '';
    $('f-honoree').value = f.honoree || '';
    $('f-title').value = f.title || '';
    $('f-date').value = f.date || '';
    $('f-time').value = f.time || '';
    $('f-venue').value = f.venue || '';
    $('f-dress').value = f.dress || '';
    $('f-rsvp').value = f.rsvp || '';
    $('f-message').value = f.message || '';
  }

  function renderLabels() {
    var tr = t();
    document.documentElement.lang = lang;
    $('h-title').textContent = tr.appTitle;
    $('h-sub').textContent = tr.appSub;
    $('langBtn').textContent = lang === 'en' ? tr.langBtn : tr.langBtnBn;
    $('checkNote').textContent = tr.checkNote;
    $('l-template').textContent = tr.template;
    $('l-style').textContent = tr.style;
    $('l-hosts').textContent = tr.hosts;
    $('l-honoree').textContent = tr.honoree;
    $('l-title').textContent = tr.eventTitle;
    $('l-date').textContent = tr.date;
    $('l-time').textContent = tr.time;
    $('l-venue').textContent = tr.venue;
    $('l-dress').textContent = tr.dress;
    $('l-rsvp').textContent = tr.rsvp;
    $('l-message').textContent = tr.message;
    $('previewTitle').textContent = tr.preview;
    $('draftsTitle').textContent = tr.drafts;
    $('noDrafts').textContent = tr.noDrafts;
    $('l-export').textContent = tr.exportLabel;
    $('l-import').textContent = tr.importLabel;
    $('l-erase').textContent = tr.eraseConfirm;
    $('btnSave').textContent = tr.saveDraft;
    $('btnCopy').textContent = tr.copyText;
    $('btnPrint').textContent = tr.printCard;
    $('btnExport').textContent = tr.exportBtn;
    $('btnImport').textContent = tr.importBtn;
    $('btnErase').textContent = tr.eraseGo;
    $('emptyPreview').textContent = tr.emptyPreview;
    // Rebuild selects with localized names.
    var tplSel = $('f-template'), stySel = $('f-style');
    var tplVal = tplSel.value, styVal = stySel.value;
    tplSel.innerHTML = '';
    L.TEMPLATES.forEach(function (tp) {
      var o = document.createElement('option');
      o.value = tp.id; o.textContent = lang === 'bn' ? tp.nameBn : tp.nameEn;
      tplSel.appendChild(o);
    });
    stySel.innerHTML = '';
    L.STYLES.forEach(function (st) {
      var o = document.createElement('option');
      o.value = st.id; o.textContent = lang === 'bn' ? st.nameBn : st.nameEn;
      stySel.appendChild(o);
    });
    if (tplVal) tplSel.value = tplVal;
    if (styVal) stySel.value = styVal;
  }

  function renderPreview() {
    var f = readForm();
    var card = $('card');
    card.className = 'card style-' + (f.style || 'gold');
    var hasAny = [f.hosts, f.title, f.date, f.venue].some(function (v) { return v && String(v).trim(); });
    $('emptyPreview').hidden = hasAny;
    card.innerHTML = hasAny ? L.buildCardHtml(f, lang) : '';
  }

  function renderDrafts() {
    var list = $('draftList');
    list.innerHTML = '';
    $('noDrafts').hidden = S.drafts.length > 0;
    S.drafts.forEach(function (d) {
      var li = document.createElement('li');
      var meta = document.createElement('div');
      meta.className = 'draft-meta';
      var tpl = L.templateById(d.fields.template);
      meta.textContent = (d.fields.title || '(untitled)') + ' \u2014 ' + (lang === 'bn' ? tpl.nameBn : tpl.nameEn);
      var sm = document.createElement('small');
      sm.textContent = L.formatDate(d.fields.date, lang) + ' \u00b7 ' + (d.fields.venue || '');
      meta.appendChild(sm);
      var btns = document.createElement('div');
      var load = document.createElement('button');
      load.type = 'button'; load.textContent = t().load; load.dataset.load = d.id;
      var del = document.createElement('button');
      del.type = 'button'; del.textContent = t().del; del.dataset.del = d.id;
      btns.appendChild(load); btns.appendChild(del);
      li.appendChild(meta); li.appendChild(btns);
      list.appendChild(li);
    });
  }

  function flash(msg) {
    var el = $('flash');
    el.textContent = msg;
    el.hidden = false;
    setTimeout(function () { el.hidden = true; }, 3500);
  }
  function showErrors(errs) {
    var ul = $('formErrors');
    if (!errs.length) { ul.hidden = true; ul.innerHTML = ''; return; }
    ul.hidden = false;
    ul.innerHTML = '<li><strong>' + L.esc(t().validationTitle) + '</strong></li>' +
      errs.map(function (e) { return '<li>' + L.esc(e) + '</li>'; }).join('');
  }

  function onInput() { showErrors([]); renderPreview(); }

  function bind() {
    ['f-template', 'f-style', 'f-hosts', 'f-honoree', 'f-title', 'f-date', 'f-time',
     'f-venue', 'f-dress', 'f-rsvp', 'f-message'].forEach(function (id) {
      $(id).addEventListener('input', onInput);
      $(id).addEventListener('change', onInput);
    });
    $('f-template').addEventListener('change', function () {
      // Suggest the template's house style only when the user has not picked one yet.
      if (!$('f-style').dataset.touched) $('f-style').value = L.templateById($('f-template').value).defaultStyle;
      renderPreview();
    });
    $('f-style').addEventListener('change', function () { $('f-style').dataset.touched = '1'; });

    $('langBtn').addEventListener('click', function () {
      lang = lang === 'en' ? 'bn' : 'en';
      S.lang = lang; saveState(S);
      renderLabels(); renderPreview(); renderDrafts();
    });

    $('btnSave').addEventListener('click', function () {
      var f = readForm();
      var errs = L.validateInvitation(f);
      showErrors(errs);
      if (errs.length) return;
      S.drafts.unshift({ id: L.newDraftId(), fields: f, updatedAt: new Date().toISOString() });
      saveState(S); renderDrafts();
      flash(t().saved);
    });

    $('draftList').addEventListener('click', function (ev) {
      var btn = ev.target.closest('button');
      if (!btn) return;
      if (btn.dataset.load) {
        var d = S.drafts.find(function (x) { return x.id === btn.dataset.load; });
        if (d) { writeForm(d.fields); renderPreview(); flash(t().loaded); }
      }
      if (btn.dataset.del) {
        S.drafts = S.drafts.filter(function (x) { return x.id !== btn.dataset.del; });
        saveState(S); renderDrafts();
        flash(t().deleted);
      }
    });

    $('btnCopy').addEventListener('click', function () {
      var f = readForm();
      var errs = L.validateInvitation(f);
      showErrors(errs);
      if (errs.length) return;
      var text = L.buildCardText(f, lang);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { flash(t().copied); },
          function () { flash(t().copyFail); });
      } else { flash(t().copyFail); }
    });

    $('btnPrint').addEventListener('click', function () {
      var f = readForm();
      var errs = L.validateInvitation(f);
      showErrors(errs);
      if (errs.length) return;
      window.print();
    });

    $('btnExport').addEventListener('click', function () {
      $('exportText').value = L.exportDrafts(S.drafts);
    });

    $('btnImport').addEventListener('click', function () {
      var res = L.importDrafts($('importText').value);
      if (!res.ok) { flash(t().importFail + res.error); return; }
      S.drafts = res.drafts.concat(S.drafts);
      saveState(S); renderDrafts();
      flash(t().importOk);
    });

    $('btnErase').addEventListener('click', function () {
      if ($('eraseInput').value.trim() !== 'DELETE') { flash(t().eraseConfirm); return; }
      S.drafts = []; $('eraseInput').value = '';
      saveState(S); renderDrafts();
      flash(t().erased);
    });
  }

  renderLabels();
  writeForm({ template: 'wedding', style: 'gold' });
  bind();
  renderPreview();
  renderDrafts();
  window.__IM_READY = true;
  window.__IM_state = function () { return { lang: lang, drafts: S.drafts }; };
})();
