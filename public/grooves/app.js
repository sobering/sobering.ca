// grooves. — vanilla JS, no frameworks, no build step.

(function () {
  'use strict';

  const raw = (window.DISCOGS_DATA && window.DISCOGS_DATA.releases) || [];

  // --- normalize --------------------------------------------------------
  function stripParen(name) {
    // "Chicago (2)" -> "Chicago", "Moxy (2)" -> "Moxy"
    return String(name || '').replace(/\s*\(\d+\)\s*$/, '').trim();
  }

  function artistDisplay(artists) {
    if (!artists || !artists.length) return 'Unknown Artist';
    return artists
      .map((a, i) => {
        const name = stripParen(a.anv || a.name);
        const join = (a.join || '').trim();
        if (i === artists.length - 1) return name;
        return name + (join ? ` ${join} ` : ' · ');
      })
      .join('');
  }

  function normalize(r) {
    const bi = r.basic_information || {};
    const artistsArr = bi.artists || [];
    const firstArtist = stripParen((artistsArr[0] && artistsArr[0].name) || 'Unknown');
    const formats = bi.formats || [];
    const formatTags = formats.flatMap(f => {
      const tags = [];
      if (f.name) tags.push(f.name);
      if (f.text) tags.push(f.text);
      if (Array.isArray(f.descriptions)) tags.push(...f.descriptions);
      return tags;
    });
    const labels = (bi.labels || []).map(l => l.name).filter(Boolean);
    const catnos = (bi.labels || []).map(l => l.catno).filter(Boolean);
    return {
      id: r.id,
      title: bi.title || '(untitled)',
      artistsDisplay: artistDisplay(artistsArr),
      artistSortKey: firstArtist.toLowerCase(),
      firstArtist,
      year: Number(bi.year) || 0,
      cover: bi.cover_image || bi.thumb || '',
      thumb: bi.thumb || '',
      labels,
      catnos,
      formats: formatTags,
      genres: bi.genres || [],
      styles: bi.styles || [],
      dateAdded: r.date_added || '',
      discogsUrl: `https://www.discogs.com/release/${r.id}`,
    };
  }

  const records = raw.map(normalize);

  // stable shuffle index per card for tilt + for shuffle feature
  records.forEach((rec, i) => {
    // deterministic tilt based on id so reloads look the same
    const h = (rec.id * 9301 + 49297) % 233280;
    rec._tilt = ((h / 233280) * 4 - 2).toFixed(2); // -2deg .. +2deg
    rec._shuffleKey = Math.random();
  });

  // --- rendering --------------------------------------------------------
  const stacksEl = document.getElementById('stacks');
  const statsEl = document.getElementById('stats');
  const searchEl = document.getElementById('search');
  const shuffleBtn = document.getElementById('shuffle');
  const tickerEl = document.getElementById('ticker');
  const counterEl = document.getElementById('counter');

  const state = {
    query: '',
    shuffled: false,
  };

  function groupByArtist(list) {
    const groups = new Map();
    for (const r of list) {
      const key = r.artistSortKey;
      if (!groups.has(key)) {
        groups.set(key, { key, displayName: r.firstArtist, items: [] });
      }
      groups.get(key).items.push(r);
    }
    // sort groups alphabetically (case-insensitive)
    const arr = [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
    // within each group, sort by year ascending; year===0 (unknown) goes last
    for (const g of arr) {
      g.items.sort((a, b) => {
        const ay = a.year || Infinity;
        const by = b.year || Infinity;
        if (ay !== by) return ay - by;
        return a.title.localeCompare(b.title);
      });
    }
    return arr;
  }

  function matchesQuery(r, q) {
    if (!q) return true;
    const hay = [
      r.title,
      r.artistsDisplay,
      r.firstArtist,
      r.labels.join(' '),
      r.catnos.join(' '),
    ].join(' ').toLowerCase();
    // support all-whitespace-separated terms as AND
    return q.toLowerCase().split(/\s+/).filter(Boolean).every(t => hay.includes(t));
  }

  // small SVG disc used behind each sleeve
  // the gleam + arc highlights live inside the rotating <svg>, so they
  // visibly travel around the disc as it spins — even when the label is hidden
  const DISC_SVG = `
<svg viewBox="0 0 100 100" aria-hidden="true">
  <defs>
    <radialGradient id="dg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1a1208"/>
      <stop offset="70%" stop-color="#0a0603"/>
      <stop offset="100%" stop-color="#000"/>
    </radialGradient>
    <radialGradient id="dgGleam" cx="30%" cy="24%" r="52%">
      <stop offset="0%"   stop-color="#ffb347" stop-opacity="0.22"/>
      <stop offset="45%"  stop-color="#ff6b1a" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#ff6b1a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="49" fill="url(#dg)"/>
  <g fill="none" stroke="#2a1a0f" stroke-width="0.4" opacity="0.8">
    <circle cx="50" cy="50" r="46"/>
    <circle cx="50" cy="50" r="42"/>
    <circle cx="50" cy="50" r="38"/>
    <circle cx="50" cy="50" r="34"/>
    <circle cx="50" cy="50" r="30"/>
    <circle cx="50" cy="50" r="26"/>
    <circle cx="50" cy="50" r="22"/>
  </g>
  <!-- subtle off-center gleam that rotates with the disc -->
  <circle cx="50" cy="50" r="49" fill="url(#dgGleam)"/>
  <!-- one soft amber arc just enough to read rotation -->
  <path d="M 16,36 A 40,40 0 0 1 48,12" stroke="#ffb347" stroke-width="0.8" stroke-linecap="round" fill="none" opacity="0.35"/>
  <path d="M 24,72 A 38,38 0 0 0 36,84" stroke="#ff6b1a" stroke-width="0.5" stroke-linecap="round" fill="none" opacity="0.22"/>
  <circle cx="50" cy="50" r="16" fill="#ff3fb5"/>
  <circle cx="50" cy="50" r="16" fill="none" stroke="#ffb347" stroke-width="0.4"/>
  <circle cx="50" cy="50" r="1.5" fill="#120d08"/>
</svg>`;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function recordCardHtml(r) {
    const yr = r.year ? r.year : '????';
    const cover = r.cover
      ? `<img src="${escapeHtml(r.cover)}" alt="cover of ${escapeHtml(r.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling && (this.nextElementSibling.style.display='grid')"/><div class="no-cover" style="display:none">no cover</div>`
      : `<div class="no-cover">no cover</div>`;
    return `
      <button type="button" class="card" data-id="${r.id}" style="--tilt:${r._tilt}deg" aria-label="${escapeHtml(r.title)} by ${escapeHtml(r.artistsDisplay)}, ${yr}">
        <div class="sleeve">
          <div class="disc">${DISC_SVG}</div>
          ${cover}
        </div>
        <div class="meta">
          <span class="title">${escapeHtml(r.title)}</span>
          <span class="sub"><span class="year">${yr}</span> &middot; ${escapeHtml(r.labels[0] || '—')}</span>
        </div>
      </button>`;
  }

  const GROOVE_DIVIDER = `
<svg class="artist-divider" viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden="true">
  <line x1="0" y1="8"  x2="1000" y2="8"  stroke="#ff6b1a" stroke-width="1"   opacity="0.55"/>
  <line x1="0" y1="12" x2="1000" y2="12" stroke="#ff3fb5" stroke-width="0.6" opacity="0.55"/>
  <line x1="0" y1="16" x2="1000" y2="16" stroke="#00f6ff" stroke-width="0.6" opacity="0.55"/>
</svg>`;

  function render() {
    let list = records.filter(r => matchesQuery(r, state.query));
    stacksEl.innerHTML = '';

    if (!list.length) {
      stacksEl.innerHTML = `
        <div class="empty">
          <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
            <rect x="20" y="40" width="80" height="60" fill="none" stroke="#ff6b1a" stroke-width="2"/>
            <rect x="28" y="46" width="4"  height="54" fill="#ff6b1a" opacity="0.4"/>
            <rect x="34" y="46" width="4"  height="54" fill="#ff6b1a" opacity="0.3"/>
            <rect x="40" y="46" width="4"  height="54" fill="#ff6b1a" opacity="0.25"/>
            <text x="60" y="32" text-anchor="middle" font-family="VT323, monospace" font-size="16" fill="#c4b89e">empty crate</text>
          </svg>
          <div>no records match "<span style="color:var(--cyan)">${escapeHtml(state.query)}</span>"</div>
        </div>`;
      updateStats(0);
      return;
    }

    if (state.shuffled) {
      // flat shuffled view, no grouping
      const shuffled = [...list].sort((a, b) => a._shuffleKey - b._shuffleKey);
      const section = document.createElement('section');
      section.className = 'artist-group';
      section.innerHTML = `
        <div class="artist-header">
          <h2 class="artist-name">The Stack</h2>
          <span class="artist-count">${shuffled.length} random</span>
        </div>
        ${GROOVE_DIVIDER}
        <div class="grid">${shuffled.map(recordCardHtml).join('')}</div>`;
      stacksEl.appendChild(section);
    } else {
      const groups = groupByArtist(list);
      for (const g of groups) {
        const section = document.createElement('section');
        section.className = 'artist-group';
        section.innerHTML = `
          <div class="artist-header">
            <h2 class="artist-name">${escapeHtml(g.displayName)}</h2>
            <span class="artist-count">${g.items.length} ${g.items.length === 1 ? 'record' : 'records'}</span>
          </div>
          ${GROOVE_DIVIDER}
          <div class="grid">${g.items.map(recordCardHtml).join('')}</div>`;
        stacksEl.appendChild(section);
      }
    }

    updateStats(list.length);
    observeGroups();
  }

  function updateStats(shownCount) {
    const totalArtists = new Set(records.map(r => r.artistSortKey)).size;
    const shownArtists = new Set(
      records.filter(r => matchesQuery(r, state.query)).map(r => r.artistSortKey)
    ).size;
    if (state.query || state.shuffled) {
      statsEl.textContent = `showing ${shownCount} of ${records.length} records · ${shownArtists} of ${totalArtists} artists`;
    } else {
      statsEl.textContent = `${records.length} records on rotation · ${totalArtists} artists`;
    }
  }

  // scroll-reveal for artist groups
  let io = null;
  function observeGroups() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.artist-group').forEach(el => el.classList.add('in'));
      return;
    }
    if (io) io.disconnect();
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    document.querySelectorAll('.artist-group').forEach(el => io.observe(el));
  }

  // --- modal ------------------------------------------------------------
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');

  function openModal(id) {
    const r = records.find(x => x.id === id);
    if (!r) return;
    const yr = r.year ? r.year : '????';
    const cover = r.cover
      ? `<img src="${escapeHtml(r.cover)}" alt="cover of ${escapeHtml(r.title)}" referrerpolicy="no-referrer"/>`
      : `<div class="no-cover">no cover</div>`;
    const labelLines = r.labels.map((n, i) => {
      const cat = r.catnos[i] ? ` <span style="color:var(--cream-dim)">· ${escapeHtml(r.catnos[i])}</span>` : '';
      return `<div>${escapeHtml(n)}${cat}</div>`;
    }).join('');
    const formatsHtml = r.formats.length
      ? r.formats.map(f => `<span class="pill" style="color:var(--amber)">${escapeHtml(f)}</span>`).join('')
      : '<span style="color:var(--cream-dim)">—</span>';
    const dateAdded = r.dateAdded
      ? new Date(r.dateAdded).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
      : '—';

    modalBody.innerHTML = `
      <div class="modal-cover">
        <div class="disc">${DISC_SVG}</div>
        ${cover}
      </div>
      <div class="modal-info">
        <h2 id="modal-title">${escapeHtml(r.title)}</h2>
        <p class="artist">${escapeHtml(r.artistsDisplay)}</p>
        <dl class="kv">
          <dt>year</dt><dd>${yr}</dd>
          <dt>label</dt><dd>${labelLines || '—'}</dd>
          <dt>added</dt><dd>${dateAdded}</dd>
        </dl>
        <div class="pills">${formatsHtml}</div>
        <div class="pills">
          ${r.genres.map(g => `<span class="pill genre">${escapeHtml(g)}</span>`).join('')}
          ${r.styles.map(s => `<span class="pill style">${escapeHtml(s)}</span>`).join('')}
        </div>
        <a class="discogs-btn" href="${r.discogsUrl}" target="_blank" rel="noopener noreferrer">
          view on discogs
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M7 17L17 7M10 7h7v7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>`;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  stacksEl.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const id = Number(card.dataset.id);
    openModal(id);
  });

  // --- search + shuffle -------------------------------------------------
  let searchTimer;
  searchEl.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = searchEl.value.trim();
      state.shuffled = false; // typing exits shuffle view
      render();
    }, 80);
  });

  shuffleBtn.addEventListener('click', () => {
    // re-randomize and toggle
    records.forEach(r => { r._shuffleKey = Math.random(); });
    state.shuffled = !state.shuffled;
    shuffleBtn.classList.toggle('active', state.shuffled);
    shuffleBtn.querySelector('span').textContent = state.shuffled ? 'restack' : 'shuffle';
    window.scrollTo({ top: stacksEl.offsetTop - 80, behavior: 'smooth' });
    render();
  });

  // --- typewriter tagline -----------------------------------------------
  const typeEl = document.getElementById('type');
  const lines = [
    '// a collection of vinyl records',
    '// hand-rolled in the basement',
    '// smoke \'em if you got \'em',
    '// side A · track 1',
  ];
  let lineIdx = 0;
  function typeLine() {
    const line = lines[lineIdx % lines.length];
    typeEl.textContent = '';
    let i = 0;
    const typer = setInterval(() => {
      typeEl.textContent = line.slice(0, ++i);
      if (i >= line.length) {
        clearInterval(typer);
        setTimeout(() => {
          const eraser = setInterval(() => {
            typeEl.textContent = typeEl.textContent.slice(0, -1);
            if (!typeEl.textContent.length) {
              clearInterval(eraser);
              lineIdx++;
              typeLine();
            }
          }, 25);
        }, 2800);
      }
    }, 45);
  }

  // --- footer ticker: cycle artist names --------------------------------
  function buildTicker() {
    const uniqueArtists = [...new Set(records.map(r => r.firstArtist))].sort();
    const text = uniqueArtists.join('  ///  ') + '  ///  ';
    // duplicate for seamless loop
    tickerEl.textContent = text + text;
  }

  // --- visitor counter (fake, based on date) ----------------------------
  function fakeVisitor() {
    // a silly pseudo-random but stable number seeded by today
    const d = new Date();
    const seed = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
    const n = ((seed * 2654435761) >>> 0) % 9999999;
    counterEl.textContent = String(n).padStart(7, '0');
  }

  // --- boot -------------------------------------------------------------
  function boot() {
    if (!records.length) {
      stacksEl.innerHTML = `<div class="empty"><div>no records found — is <code>data.js</code> loaded?</div></div>`;
      return;
    }
    render();
    typeLine();
    buildTicker();
    fakeVisitor();
  }

  boot();
})();
