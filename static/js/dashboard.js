/* ==========================================================================
   Dashboard - Vanilla JS + Chart.js

   Fonte de dados:
     - API Flask (/api/projects, /api/projects/<id>/dashboard, .../emails)
     - /api/settings: conexao com o Outlook (icone de engrenagem)
     - window.MOCK_DATA (static/js/mock-data.js) SOMENTE quando a pagina e
       aberta com ?mock=1 ou direto do disco (file://). O mock tem exatamente
       o mesmo formato das respostas da API. Sem isso o app comeca vazio.
   ========================================================================== */
(function () {
  'use strict';

  const params = new URLSearchParams(location.search);
  const useMock = params.has('mock') || location.protocol === 'file:';

  const state = {
    projects: [],
    settings: null,
    projectId: null,
    days: 30,
    dashboard: null,
    emails: [],
    volumeMode: 'daily',
    filter: { level: '', q: '' },
    sort: { key: 'date_received', dir: -1 },
    page: 0,
    pageSize: 12,
    open: new Set(),
  };
  const charts = {};

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const LEVEL_LABEL = { critica: 'Crítica', alta: 'Alta', media: 'Média', baixa: 'Baixa' };
  const TRIGGER_LABEL = {
    urgente: 'urgente', bloqueado: 'bloqueado', prazo: 'prazo', entregar: 'entregar',
    revisar: 'revisar', reuniao: 'reunião', risco: 'risco',
  };

  // ------------------------------------------------------------ utilitarios
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // datas do backend sao UTC sem fuso; o "Z" faz o navegador converter
  function toDate(iso) { return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + 'Z'); }
  const fmtDateTime = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  const fmtDay = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
  function relTime(iso) {
    const diff = (Date.now() - toDate(iso).getTime()) / 36e5;
    if (diff < 1) return 'agora';
    if (diff < 24) return `há ${Math.round(diff)} h`;
    const d = Math.round(diff / 24);
    return d === 1 ? 'ontem' : `há ${d} dias`;
  }

  function toast(msg, isError = false) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.toggle('is-error', isError);
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 3800);
  }

  // Tokens de cor do tema atual (Chart.js precisa de cores literais)
  function token(name, alpha = 1) {
    const rgb = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim().split(/\s+/).join(',');
    return `rgba(${rgb},${alpha})`;
  }

  // --------------------------------------------------------------- dados
  async function api(path, options) {
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
    return body;
  }

  async function loadProjects() {
    state.projects = useMock ? window.MOCK_DATA.projects : await api('/api/projects');
  }

  async function loadProject() {
    const id = state.projectId;
    if (useMock) {
      state.dashboard = window.MOCK_DATA.dashboard;
      state.emails = window.MOCK_DATA.emails;
      return;
    }
    const [dash, emails] = await Promise.all([
      api(`/api/projects/${id}/dashboard?days=${state.days}`),
      api(`/api/projects/${id}/emails`),
    ]);
    state.dashboard = dash;
    state.emails = emails;
  }

  async function refresh() {
    await loadProject();
    state.page = 0;
    state.open.clear();
    renderAll();
  }

  // ------------------------------------------------------------- render
  // Sem projetos: esconde o painel e mostra os dois passos iniciais
  function renderEmpty() {
    const empty = !state.projects.length;
    $('#projectContent').classList.toggle('hidden', empty);
    $('#emptyState').classList.toggle('hidden', !empty);
    $('#heroActions').classList.toggle('hidden', empty);
    $('#projectTabsSection').classList.toggle('hidden', empty);
    if (empty) {
      $('#heroTag').textContent = 'Inbox de projetos';
      $('#heroTitle').textContent = 'Nenhum projeto ainda';
      $('#heroDesc').textContent = 'Conecte a caixa do Outlook e crie um projeto. Os e-mails aparecem aqui depois da primeira sincronização.';
      document.title = 'Project Manager';
    }
    return empty;
  }

  function renderAll() {
    renderHero();
    renderProjectTabs();
    renderKpis();
    renderCharts();
    renderAlerts();
    renderKeywords();
    renderTable();
  }

  function renderHero() {
    const p = state.dashboard.project;
    $('#heroTag').textContent = `Inbox do projeto · ${p.outlook_folder_or_tag}`;
    $('#heroTitle').textContent = p.name;
    $('#heroDesc').textContent = p.description || 'Sem descrição.';
    document.title = `${p.name} | Project Manager`;
  }

  function renderProjectTabs() {
    const wrap = $('#projectTabs');
    const tabs = state.projects.map((p, i) => `
      <button type="button" class="project-tab p-6 md:p-8 group card-hover ${p.id === state.projectId ? 'is-active' : ''}" data-project="${p.id}">
        <span class="relative eyebrow block mb-2 ${p.id === state.projectId ? '!text-accent' : ''}">Projeto ${String(i + 1).padStart(2, '0')} · ${esc(p.outlook_folder_or_tag)}</span>
        <span class="relative block text-xl font-medium tracking-tight text-fg mb-1 transition-colors group-hover:text-accent">${esc(p.name)}</span>
        <span class="relative block text-sm text-muted">${p.email_count} e-mails · <span class="${p.urgent_count ? 'text-accent' : ''}">${p.urgent_count} urgentes</span></span>
      </button>`).join('');
    wrap.innerHTML = tabs + `
      <button type="button" id="btnNewProject" class="p-6 md:p-8 text-left group card-hover flex items-center gap-4">
        <span class="flex items-center justify-center w-12 h-12 rounded-full border border-line/10 bg-line/5 text-fg transition-colors group-hover:text-accent group-hover:border-accent/50">
          <iconify-icon icon="solar:add-circle-bold-duotone" width="22"></iconify-icon>
        </span>
        <span>
          <span class="eyebrow block mb-1">Adicionar</span>
          <span class="block text-lg font-medium tracking-tight text-fg">Novo projeto</span>
        </span>
      </button>`;
  }

  function renderKpis() {
    const k = state.dashboard.kpis;
    const items = [
      ['Total no projeto', k.total, 'solar:letter-bold-duotone'],
      ['Últimos 7 dias', k.last_7d, 'solar:calendar-bold-duotone'],
      ['Críticos', k.critical, 'solar:danger-triangle-bold-duotone', true],
      ['Stakeholders', k.senders, 'solar:users-group-rounded-bold-duotone'],
      ['Nota média', Number(k.avg_score).toLocaleString('pt-BR'), 'solar:graph-up-bold-duotone'],
    ];
    $('#kpis').innerHTML = items.map(([label, value, icon, hot]) => `
      <div class="p-6 group card-hover">
        <div class="flex items-center justify-between mb-4">
          <span class="eyebrow">${label}</span>
          <iconify-icon icon="${icon}" class="${hot ? 'text-accent' : 'text-subtle'}" width="18"></iconify-icon>
        </div>
        <span class="block text-4xl font-medium tracking-tight ${hot && value ? 'text-accent' : 'text-fg'}">${value}</span>
      </div>`).join('');
  }

  function baseChartOptions() {
    const grid = token('line', 0.06);
    const tick = token('subtle');
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 350 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom', align: 'start',
          labels: { color: token('muted'), boxWidth: 10, boxHeight: 10, font: { family: 'Geist', size: 11 } },
        },
        tooltip: {
          backgroundColor: token('panel'), titleColor: token('fg'), bodyColor: token('ink'),
          borderColor: token('line', 0.12), borderWidth: 1, padding: 10, cornerRadius: 0,
          titleFont: { family: 'Geist', weight: '500' }, bodyFont: { family: 'Geist' },
        },
      },
      scales: {
        x: { stacked: true, grid: { display: false }, border: { color: grid }, ticks: { color: tick, font: { family: 'Geist', size: 11 }, maxRotation: 0, autoSkipPadding: 12 } },
        y: { stacked: true, beginAtZero: true, grid: { color: grid }, border: { display: false }, ticks: { color: tick, precision: 0, font: { family: 'Geist', size: 11 } } },
      },
    };
  }

  function renderCharts() {
    if (!window.Chart) { setTimeout(renderCharts, 80); return; }  // CDN com defer
    const v = state.dashboard.volume[state.volumeMode];
    const labels = v.labels.map((d) => (state.volumeMode === 'weekly' ? 'Sem. ' : '') + fmtDay.format(new Date(d + 'T12:00:00')));
    const others = v.total.map((t, i) => t - v.urgent[i]);

    charts.volume?.destroy();
    charts.volume = new Chart($('#chartVolume'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Urgentes', data: v.urgent, backgroundColor: token('accent-strong', 0.9), borderRadius: 2, maxBarThickness: 28 },
          { label: 'Demais', data: others, backgroundColor: token('subtle', 0.35), borderRadius: 2, maxBarThickness: 28 },
        ],
      },
      options: baseChartOptions(),
    });

    const s = state.dashboard.top_senders;
    const opts = baseChartOptions();
    opts.indexAxis = 'y';
    opts.scales.x.grid = { color: token('line', 0.06) };
    opts.scales.y.grid = { display: false };
    opts.scales.y.ticks = { ...opts.scales.y.ticks, color: token('ink') };
    charts.senders?.destroy();
    charts.senders = new Chart($('#chartSenders'), {
      type: 'bar',
      data: {
        labels: s.map((x) => x.sender),
        datasets: [
          { label: 'Urgentes', data: s.map((x) => x.urgent), backgroundColor: token('accent-strong', 0.9), borderRadius: 2, maxBarThickness: 18 },
          { label: 'Demais', data: s.map((x) => x.count - x.urgent), backgroundColor: token('subtle', 0.35), borderRadius: 2, maxBarThickness: 18 },
        ],
      },
      options: opts,
    });
  }

  function highlight(sentence, dates = [], names = []) {
    let html = esc(sentence);
    names.forEach((n) => { html = html.replace(new RegExp(escRe(esc(n)), 'g'), `<mark class="hl-name">${esc(n)}</mark>`); });
    dates.forEach((d) => { html = html.replace(new RegExp(`(?<![\\w>])${escRe(esc(d))}(?![\\w<])`, 'g'), `<mark class="hl-date">${esc(d)}</mark>`); });
    return html;
  }

  function renderAlerts() {
    const alerts = state.dashboard.alerts;
    $('#alertCount').textContent = alerts.length;
    $('#alerts').innerHTML = alerts.length ? alerts.map((a) => `
      <li>
        <button type="button" class="w-full text-left flex gap-4 px-2 py-4 card-hover" data-goto="${a.email_id}">
          <span class="w-0.5 self-stretch sev-bar-${a.level}"></span>
          <span class="flex-1 min-w-0">
            <span class="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
              <span class="sev sev-${a.level}">${LEVEL_LABEL[a.level]} · ${a.score}</span>
              <span class="text-xs text-subtle">${esc(a.sender)} · ${relTime(a.date)}</span>
            </span>
            <span class="block text-sm font-medium text-fg truncate">${esc(a.subject)}</span>
            ${a.sentence ? `<span class="block text-sm text-muted mt-1 leading-relaxed">“${highlight(a.sentence, a.dates)}”</span>` : ''}
            <span class="flex flex-wrap gap-1.5 mt-2">${a.triggers.map((t) => `<span class="chip chip-accent">${TRIGGER_LABEL[t] || t}</span>`).join('')}</span>
          </span>
        </button>
      </li>`).join('')
      : '<li class="px-2 py-10 text-sm text-muted">Nenhum alerta alto ou crítico. 🎉</li>';
  }

  function renderKeywords() {
    const kws = state.dashboard.keywords;
    const max = Math.max(1, ...kws.map((k) => k.count));
    $('#keywords').innerHTML = kws.map((k, i) => `
      <li>
        <div class="flex items-baseline justify-between text-sm mb-1.5">
          <span class="text-fg"><span class="text-subtle font-mono text-xs mr-2">${String(i + 1).padStart(2, '0')}</span>${esc(k.word)}</span>
          <span class="text-subtle font-mono text-xs">${k.count}</span>
        </div>
        <div class="bg-line/5"><div class="kw-bar" style="width:${(k.count / max) * 100}%"></div></div>
      </li>`).join('') || '<li class="text-sm text-muted">Sem dados no período.</li>';
  }

  // -------------------------------------------------------------- tabela
  function filteredEmails() {
    const q = state.filter.q.trim().toLowerCase();
    const { key, dir } = state.sort;
    return state.emails
      .filter((e) => !state.filter.level || e.urgency_level === state.filter.level)
      .filter((e) => !q || [e.subject, e.sender, e.sender_email, e.clean_summary, ...e.keywords.map((k) => k.word)]
        .join(' ').toLowerCase().includes(q))
      .sort((a, b) => {
        const x = a[key], y = b[key];
        return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'pt-BR')) * dir;
      });
  }

  function detailHtml(e) {
    const actions = e.action_items.length ? e.action_items.map((a) => `
      <li class="flex gap-3">
        <iconify-icon icon="${a.followed_by_context ? 'solar:check-circle-bold' : 'solar:record-circle-linear'}" class="mt-0.5 shrink-0 ${a.followed_by_context ? 'text-accent' : 'text-subtle'}"></iconify-icon>
        <span>
          <span class="text-sm text-ink leading-relaxed">${highlight(a.sentence, a.dates, a.names)}</span>
          <span class="flex flex-wrap gap-1.5 mt-1.5">${a.triggers.map((t) => `<span class="chip chip-accent">${TRIGGER_LABEL[t] || t}</span>`).join('')}
            <span class="chip">pontos <b>${a.score}</b></span></span>
        </span>
      </li>`).join('') : '<li class="text-sm text-muted">Nenhuma sentença com gatilho de ação.</li>';

    const breakdown = Object.entries(e.urgency_breakdown || {})
      .map(([k, v]) => `<span class="chip">${esc(k.replace(/_/g, ' '))} <b>${v > 0 ? '+' : ''}${v}</b></span>`).join('');

    return `
      <div class="grid lg:grid-cols-5 gap-px bg-line/5">
        <div class="lg:col-span-3 bg-panel p-6 md:p-8 space-y-6">
          <div>
            <p class="eyebrow mb-2 !text-accent">Resumo gerado</p>
            <p class="text-base text-fg leading-relaxed">${esc(e.clean_summary)}</p>
          </div>
          <div>
            <p class="eyebrow mb-3">Sentenças importantes</p>
            <ul class="space-y-3">${actions}</ul>
          </div>
          <div>
            <p class="eyebrow mb-3">Texto</p>
            <div class="seg mb-3" data-tabs="${e.id}">
              <button type="button" class="is-active" data-view="clean">Limpo</button>
              <button type="button" data-view="raw">Original</button>
              <button type="button" data-view="html">Visualizar HTML</button>
            </div>
            <div data-view-body="${e.id}"><pre class="pre-box">${esc(e.clean_body)}</pre></div>
          </div>
        </div>
        <div class="lg:col-span-2 bg-panel p-6 md:p-8 space-y-6">
          <div>
            <p class="eyebrow mb-3">Remetente</p>
            <p class="text-fg">${esc(e.sender)}</p>
            <p class="text-sm text-muted font-mono">${esc(e.sender_email)}</p>
            <p class="text-sm text-muted mt-1">${fmtDateTime.format(toDate(e.date_received))}</p>
          </div>
          <div>
            <p class="eyebrow mb-3">Palavras-chave</p>
            <div class="flex flex-wrap gap-1.5">${e.keywords.map((k) => `<span class="chip">${esc(k.word)} <b>${k.count}</b></span>`).join('')}</div>
          </div>
          <div>
            <p class="eyebrow mb-3">Composição da nota · ${e.urgency_score}</p>
            <div class="flex flex-wrap gap-1.5">${breakdown || '<span class="text-sm text-muted">Sem gatilhos.</span>'}</div>
          </div>
        </div>
      </div>`;
  }

  function renderTable() {
    const rows = filteredEmails();
    const pages = Math.max(1, Math.ceil(rows.length / state.pageSize));
    state.page = Math.min(state.page, pages - 1);
    const slice = rows.slice(state.page * state.pageSize, (state.page + 1) * state.pageSize);

    $('#emailRows').innerHTML = slice.map((e) => {
      const open = state.open.has(e.id);
      return `
        <tr class="row ${open ? 'is-open' : ''}" data-id="${e.id}" tabindex="0" aria-expanded="${open}">
          <td><iconify-icon class="caret" icon="solar:alt-arrow-right-linear"></iconify-icon></td>
          <td class="whitespace-nowrap text-muted">${fmtDateTime.format(toDate(e.date_received))}</td>
          <td class="whitespace-nowrap hidden md:table-cell"><span class="text-fg">${esc(e.sender)}</span></td>
          <td class="min-w-[14rem]">
            <span class="block text-xs text-accent mb-0.5 md:hidden">${esc(e.sender)}</span>
            <span class="block text-fg">${esc(e.subject)}</span>
            <span class="block text-xs text-subtle mt-1 line-clamp-1">${esc(e.clean_summary)}</span>
          </td>
          <td class="text-right"><span class="sev sev-${e.urgency_level}">${LEVEL_LABEL[e.urgency_level]} · ${e.urgency_score}</span></td>
        </tr>
        ${open ? `<tr class="detail"><td colspan="5" class="max-w-0">${detailHtml(e)}</td></tr>` : ''}`;
    }).join('') || '<tr><td colspan="5" class="py-12 text-center text-muted">Nenhum e-mail encontrado.</td></tr>';

    const from = rows.length ? state.page * state.pageSize + 1 : 0;
    $('#pageInfo').textContent = `${from}–${Math.min(rows.length, (state.page + 1) * state.pageSize)} de ${rows.length} e-mails`;
    $('#prevPage').disabled = state.page === 0;
    $('#nextPage').disabled = state.page >= pages - 1;

    $$('#emailTable th[data-sort]').forEach((th) => {
      const on = th.dataset.sort === state.sort.key;
      th.classList.toggle('sorted', on);
      th.querySelector('.arrow').textContent = on && state.sort.dir === 1 ? '↑' : '↓';
    });
  }

  function showTextView(id, view) {
    const e = state.emails.find((x) => x.id === id);
    const box = $(`[data-view-body="${id}"]`);
    if (!e || !box) return;
    if (view === 'html') {
      // sandbox vazio: sem scripts, sem formularios, sem navegacao
      box.innerHTML = '<iframe class="html-preview" sandbox="" referrerpolicy="no-referrer" title="Visualização do e-mail original"></iframe>';
      box.firstChild.srcdoc = e.raw_body;
    } else {
      box.innerHTML = `<pre class="pre-box">${esc(view === 'raw' ? e.raw_body : e.clean_body)}</pre>`;
    }
    $$(`[data-tabs="${id}"] button`).forEach((b) => b.classList.toggle('is-active', b.dataset.view === view));
  }

  // ------------------------------------------------------- configuracoes
  const SECRET_FIELDS = ['o365_client_secret', 'imap_oauth_token', 'imap_password'];

  async function loadSettings() {
    if (useMock) { $('#outlookStatusText').textContent = 'Dados fictícios'; return; }
    try {
      state.settings = await api('/api/settings');
    } catch (err) {
      console.error(err);
    }
    renderSettingsStatus();
  }

  function renderSettingsStatus() {
    const st = state.settings;
    const ok = !!(st && st.configured);
    const status = $('#outlookStatus');
    status.classList.toggle('is-connected', ok);
    status.classList.toggle('is-pending', !ok);
    $('#outlookStatusText').textContent = ok ? st.mailbox : 'Outlook não configurado';
    $('#btnSettings').classList.toggle('needs-attention', !ok);
    const step = $('#stepOutlookState');
    step.classList.toggle('is-connected', ok);
    step.classList.toggle('is-pending', !ok);
    step.lastChild.textContent = ok ? `Configurado · ${st.mailbox}` : 'Pendente';
  }

  function setBackend(backend) {
    const form = $('#formSettings');
    form.elements.backend.value = backend;
    $$('#backendSeg button').forEach((b) => {
      const on = b.dataset.backend === backend;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-checked', on);
    });
    $$('[data-backend-panel]').forEach((p) => p.classList.toggle('hidden', p.dataset.backendPanel !== backend));
  }

  function showSettingsResult(msg, ok) {
    const el = $('#settingsResult');
    el.textContent = msg;
    el.classList.remove('hidden', 'is-ok', 'is-error');
    el.classList.add(ok ? 'is-ok' : 'is-error');
  }

  function settingsFormData() {
    const form = $('#formSettings');
    const data = Object.fromEntries(new FormData(form));
    data.mark_as_read = form.elements.mark_as_read.checked;
    return data;
  }

  async function openSettings() {
    if (useMock) { toast('Modo mock: configurações desativadas.'); return; }
    await loadSettings();
    const st = state.settings || {};
    const form = $('#formSettings');
    form.reset();
    ['mailbox', 'o365_tenant_id', 'o365_client_id', 'imap_host', 'imap_port', 'fetch_limit'].forEach((k) => {
      form.elements[k].value = st[k] ?? '';
    });
    form.elements.mark_as_read.checked = st.mark_as_read === '1';
    // segredo salvo nunca volta do servidor: campo vazio = manter
    SECRET_FIELDS.forEach((k) => {
      form.elements[k].value = '';
      form.elements[k].placeholder = st[`${k}_set`] ? '•••••••• salvo · deixe em branco para manter' : '';
    });
    setBackend(st.backend || 'o365');
    $('#settingsResult').classList.add('hidden');
    $('#dlgSettings').showModal();
    form.elements.mailbox.focus();
  }

  function bindSettings() {
    $('#btnSettings').addEventListener('click', openSettings);
    $('#outlookStatus').addEventListener('click', openSettings);
    $$('#backendSeg button').forEach((b) => b.addEventListener('click', () => setBackend(b.dataset.backend)));

    $('#btnTestConn').addEventListener('click', async (ev) => {
      const btn = ev.currentTarget;
      btn.disabled = true;
      showSettingsResult('Testando conexão…', true);
      try {
        const r = await api('/api/settings/test', { method: 'POST', body: JSON.stringify(settingsFormData()) });
        showSettingsResult(r.message, true);
      } catch (err) {
        showSettingsResult(err.message, false);
      } finally {
        btn.disabled = false;
      }
    });

    $('#formSettings').addEventListener('submit', async (ev) => {
      if (ev.submitter && ev.submitter.value === 'cancel') return;  // fecha normalmente
      ev.preventDefault();
      const btn = $('#btnSaveSettings');
      btn.disabled = true;
      try {
        state.settings = await api('/api/settings', { method: 'PUT', body: JSON.stringify(settingsFormData()) });
        renderSettingsStatus();
        $('#dlgSettings').close();
        toast(state.settings.configured
          ? `Outlook configurado: ${state.settings.mailbox}.`
          : `Salvo. Ainda falta: ${state.settings.missing.join(', ')}.`);
      } catch (err) {
        showSettingsResult(err.message, false);
      } finally {
        btn.disabled = false;
      }
    });
  }

  // ---------------------------------------------------------------- tema
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#F7F6F2' : '#0B0C15';
    try { localStorage.setItem('pm-theme', theme); } catch (e) { /* modo privado */ }
    if (state.dashboard) renderCharts();  // Chart.js guarda cores literais
  }

  // --------------------------------------------------------------- eventos
  function bindEvents() {
    bindSettings();
    $$('[data-open]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.open === 'settings') openSettings();
      else $('#dlgProject').showModal();
    }));
    $('#themeToggle').addEventListener('click', () => {
      setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });

    $('#projectTabs').addEventListener('click', async (ev) => {
      if (ev.target.closest('#btnNewProject')) { $('#dlgProject').showModal(); return; }
      const tab = ev.target.closest('[data-project]');
      if (!tab || Number(tab.dataset.project) === state.projectId) return;
      if (useMock) { toast('Modo mock: apenas o projeto de exemplo tem dados.'); return; }
      state.projectId = Number(tab.dataset.project);
      history.replaceState(null, '', `?project=${state.projectId}`);
      await refresh();
    });

    $('#selDays').addEventListener('change', async (ev) => {
      state.days = Number(ev.target.value);
      await refresh();
    });

    $$('[data-volume]').forEach((b) => b.addEventListener('click', () => {
      state.volumeMode = b.dataset.volume;
      $$('[data-volume]').forEach((x) => x.classList.toggle('is-active', x === b));
      renderCharts();
    }));

    $('#levelFilter').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-level]');
      if (!b) return;
      state.filter.level = b.dataset.level;
      state.page = 0;
      $$('#levelFilter button').forEach((x) => x.classList.toggle('is-active', x === b));
      renderTable();
    });

    let searchTimer;
    $('#search').addEventListener('input', (ev) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { state.filter.q = ev.target.value; state.page = 0; renderTable(); }, 150);
    });

    $('#emailTable thead').addEventListener('click', (ev) => {
      const th = ev.target.closest('th[data-sort]');
      if (!th) return;
      const key = th.dataset.sort;
      state.sort = { key, dir: state.sort.key === key ? -state.sort.dir : (key === 'subject' || key === 'sender' ? 1 : -1) };
      renderTable();
    });

    const toggleRow = (row) => {
      const id = Number(row.dataset.id);
      state.open.has(id) ? state.open.delete(id) : state.open.add(id);
      renderTable();
    };
    $('#emailRows').addEventListener('click', (ev) => {
      const tabBtn = ev.target.closest('[data-tabs] button');
      if (tabBtn) { showTextView(Number(tabBtn.parentElement.dataset.tabs), tabBtn.dataset.view); return; }
      const row = ev.target.closest('tr.row');
      if (row) toggleRow(row);
    });
    $('#emailRows').addEventListener('keydown', (ev) => {
      const row = ev.target.closest('tr.row');
      if (row && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); toggleRow(row); }
    });

    $('#prevPage').addEventListener('click', () => { state.page--; renderTable(); });
    $('#nextPage').addEventListener('click', () => { state.page++; renderTable(); });

    // alerta -> abre o e-mail na tabela
    $('#alerts').addEventListener('click', (ev) => {
      const item = ev.target.closest('[data-goto]');
      if (!item) return;
      const id = Number(item.dataset.goto);
      state.filter = { level: '', q: '' };
      $('#search').value = '';
      $$('#levelFilter button').forEach((x) => x.classList.toggle('is-active', x.dataset.level === ''));
      const idx = filteredEmails().findIndex((e) => e.id === id);
      state.page = Math.max(0, Math.floor(idx / state.pageSize));
      state.open.add(id);
      renderTable();
      document.querySelector(`tr.row[data-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    $('#btnSync').addEventListener('click', async (ev) => {
      if (useMock) { toast('Modo mock: sincronização desativada.'); return; }
      const btn = ev.currentTarget;
      btn.disabled = true;
      try {
        const r = await api(`/api/projects/${state.projectId}/sync`, { method: 'POST' });
        toast(`${r.fetched} e-mail(s) lidos, ${r.new} novo(s) processado(s).`);
        state.projects = await api('/api/projects');
        await refresh();
      } catch (err) {
        toast(err.message, true);
        if (/Configure a conex/.test(err.message)) openSettings();
      } finally {
        btn.disabled = false;
      }
    });

    $('#btnPaste').addEventListener('click', () => $('#dlgPaste').showModal());

    $('#dlgPaste').addEventListener('close', async () => {
      const dlg = $('#dlgPaste');
      if (dlg.returnValue !== 'ok') return;
      const data = Object.fromEntries(new FormData($('#formPaste')));
      if (useMock) { toast('Modo mock: processamento desativado.'); return; }
      try {
        const r = await api(`/api/projects/${state.projectId}/emails`, { method: 'POST', body: JSON.stringify(data) });
        $('#formPaste').reset();
        state.projects = await api('/api/projects');
        await refresh();
        state.open.add(r.id);
        renderTable();
        toast('E-mail processado pelo motor de regras.');
      } catch (err) {
        toast(err.message, true);
      }
    });

    $('#dlgProject').addEventListener('close', async () => {
      const dlg = $('#dlgProject');
      if (dlg.returnValue !== 'ok') return;
      const data = Object.fromEntries(new FormData($('#formProject')));
      if (useMock) { toast('Modo mock: criação desativada.'); return; }
      try {
        const p = await api('/api/projects', { method: 'POST', body: JSON.stringify(data) });
        $('#formProject').reset();
        state.projects = await api('/api/projects');
        state.projectId = p.id;
        history.replaceState(null, '', `?project=${p.id}`);
        renderEmpty();
        await refresh();
        toast(state.settings && state.settings.configured
          ? `Projeto “${p.name}” criado. Clique em Sincronizar Outlook.`
          : `Projeto “${p.name}” criado. Configure o Outlook na engrenagem para sincronizar.`);
      } catch (err) {
        toast(err.message, true);
      }
    });
  }

  // -------------------------------------------------------------- inicio
  async function init() {
    bindEvents();
    try {
      await Promise.all([loadProjects(), loadSettings()]);
      if (renderEmpty()) return;
      const wanted = Number(params.get('project'));
      state.projectId = state.projects.some((p) => p.id === wanted) ? wanted : state.projects[0].id;
      await refresh();
      if (useMock) toast('Exibindo dados fictícios (MOCK_DATA).');
    } catch (err) {
      console.error(err);
      toast(`Erro ao carregar: ${err.message}`, true);
    }
  }

  init();
})();
