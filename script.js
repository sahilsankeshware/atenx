document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
const navToggle = document.getElementById('navToggle');
const navClose = document.getElementById('navClose');
const mobileMenu = document.getElementById('mobileMenu');
navToggle?.addEventListener('click', () => mobileMenu.classList.add('open'));
navClose?.addEventListener('click', () => mobileMenu.classList.remove('open'));
mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

// Countdown to midnight (local time) — "offer resets in"
function updateCountdown() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;
  const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  const el = document.getElementById('cdTime');
  if (el) el.textContent = `${h}:${m}:${s}`;
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Share button
document.getElementById('shareBtn')?.addEventListener('click', async () => {
  const shareData = { title: 'ATENX', text: "Check out today's offer at ATENX", url: window.location.href };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch (e) { /* cancelled */ }
  } else {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const btn = document.getElementById('shareBtn');
      const original = btn.textContent;
      btn.textContent = 'Link copied ✓';
      setTimeout(() => (btn.textContent = original), 1800);
    } catch (e) { /* clipboard unavailable */ }
  }
});

// Load content
fetch('data.json?t=' + Date.now())
  .then(r => r.json())
  .then(renderSite)
  .catch(() => {
    const el = document.getElementById('offerTitle');
    if (el) el.textContent = "Today's offer is coming soon — check back shortly.";
  });

function renderSite(data) {
  // Ticker
  const track = document.getElementById('tickerTrack');
  if (track && data.ticker?.length) {
    const items = data.ticker.map(t => `<span class="ticker-item">${escapeHtml(t)}</span>`).join('');
    track.innerHTML = items + items; // duplicate for seamless loop
  }

  // Today's offer
  if (data.todayOffer) {
    document.getElementById('offerTag').textContent = data.todayOffer.tag || 'TODAY ONLY';
    document.getElementById('offerTitle').textContent = data.todayOffer.title || '';
    document.getElementById('offerDesc').textContent = data.todayOffer.description || '';
  }

  // Pricing
  if (data.pricing?.length) renderPricing(data.pricing);

  // Gym info
  if (data.gymInfo) {
    document.getElementById('visitAddress').textContent = data.gymInfo.address || '—';
    document.getElementById('visitMap').href = data.gymInfo.mapLink || '#';
    document.getElementById('visitPhone').textContent = data.gymInfo.phone || '—';
    document.getElementById('visitPhone').href = 'tel:' + (data.gymInfo.phone || '').replace(/\s/g, '');
    document.getElementById('visitWhatsapp').href = data.gymInfo.whatsapp ? `https://wa.me/${data.gymInfo.whatsapp}` : '#';
    const hoursEl = document.getElementById('visitHours');
    hoursEl.innerHTML = (data.gymInfo.hours || []).map(h =>
      `<div class="hours-row"><span>${escapeHtml(h.days)}</span><span>${escapeHtml(h.time)}</span></div>`
    ).join('');
  }
}

function renderPricing(categories) {
  const tabsEl = document.getElementById('priceTabs');
  const gridEl = document.getElementById('priceGrid');

  tabsEl.innerHTML = categories.map((c, i) =>
    `<button class="price-tab ${i === 0 ? 'active' : ''}" data-idx="${i}">${escapeHtml(c.category)}</button>`
  ).join('');

  function paint(idx) {
    const plans = categories[idx].plans || [];
    gridEl.innerHTML = plans.map(p => `
      <div class="price-card ${p.highlight ? 'highlight' : ''}">
        <div class="price-name">${escapeHtml(p.name)}</div>
        <div class="price-amount">${escapeHtml(p.price)} <span>${escapeHtml(p.period || '')}</span></div>
        <ul class="price-features">
          ${(p.features || []).map(f => `<li>${escapeHtml(f)}</li>`).join('')}
        </ul>
        <div class="price-cta"><a href="#visit" class="btn ${p.highlight ? 'btn-volt' : 'btn-outline'}" style="width:100%; text-align:center;">Choose plan</a></div>
      </div>
    `).join('');
  }

  tabsEl.querySelectorAll('.price-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.price-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      paint(Number(btn.dataset.idx));
    });
  });

  paint(0);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
