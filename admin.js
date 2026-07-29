let state = { data: null, sha: null, owner: '', repo: '', branch: 'main', token: '' };

const $ = id => document.getElementById(id);

// Prefill remembered token
const savedToken = localStorage.getItem('atenx_token');
const savedRepo = localStorage.getItem('atenx_repo');
const savedBranch = localStorage.getItem('atenx_branch');
if (savedToken) { $('tokenInput').value = savedToken; $('rememberToken').checked = true; }
if (savedRepo) $('ownerRepo').value = savedRepo;
if (savedBranch) $('branchName').value = savedBranch;

$('connectBtn').addEventListener('click', connect);

async function connect() {
  const ownerRepo = $('ownerRepo').value.trim();
  const branch = $('branchName').value.trim() || 'main';
  const token = $('tokenInput').value.trim();
  const gateStatus = $('gateStatus');

  if (!ownerRepo.includes('/') || !token) {
    gateStatus.textContent = 'Enter the repo (owner/repo) and your token.';
    gateStatus.style.color = 'var(--ember)';
    return;
  }
  const [owner, repo] = ownerRepo.split('/');
  state.owner = owner; state.repo = repo; state.branch = branch; state.token = token;

  gateStatus.textContent = 'Connecting…';
  gateStatus.style.color = 'var(--paper-dim)';

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data.json?ref=${branch}`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' }
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) throw new Error('Token rejected — check it has write access to this repo.');
      if (res.status === 404) throw new Error('data.json not found — check the repo name and branch.');
      throw new Error(`GitHub returned ${res.status}.`);
    }
    const json = await res.json();
    state.sha = json.sha;
    const content = decodeURIComponent(escape(atob(json.content)));
    state.data = JSON.parse(content);

    if ($('rememberToken').checked) {
      localStorage.setItem('atenx_token', token);
      localStorage.setItem('atenx_repo', ownerRepo);
      localStorage.setItem('atenx_branch', branch);
    } else {
      localStorage.removeItem('atenx_token');
    }

    populateForm(state.data);
    $('gate').style.display = 'none';
    $('app').style.display = 'block';
  } catch (err) {
    gateStatus.textContent = err.message;
    gateStatus.style.color = 'var(--ember)';
  }
}

function populateForm(data) {
  $('offerTag').value = data.todayOffer?.tag || '';
  $('offerTitle').value = data.todayOffer?.title || '';
  $('offerDesc').value = data.todayOffer?.description || '';
  $('tickerText').value = (data.ticker || []).join('\n');

  $('giPhone').value = data.gymInfo?.phone || '';
  $('giWhatsapp').value = data.gymInfo?.whatsapp || '';
  $('giAddress').value = data.gymInfo?.address || '';
  $('giMap').value = data.gymInfo?.mapLink || '';
  $('giHours').value = (data.gymInfo?.hours || []).map(h => `${h.days} | ${h.time}`).join('\n');

  renderPricingEditor(data.pricing || []);
}

function renderPricingEditor(categories) {
  const wrap = $('pricingEditor');
  wrap.innerHTML = '';
  categories.forEach((cat, ci) => wrap.appendChild(buildCategoryBlock(cat, ci)));
}

function buildCategoryBlock(cat, ci) {
  const block = document.createElement('div');
  block.className = 'cat-block';
  block.dataset.ci = ci;

  const head = document.createElement('div');
  head.className = 'cat-head';
  head.innerHTML = `<strong style="font-family:var(--body); font-weight:600;">Category</strong>`;
  const removeCat = document.createElement('button');
  removeCat.className = 'small-btn danger-btn';
  removeCat.type = 'button';
  removeCat.textContent = 'Remove category';
  removeCat.addEventListener('click', () => block.remove());
  head.appendChild(removeCat);
  block.appendChild(head);

  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Category name';
  const nameInput = document.createElement('input');
  nameInput.type = 'text'; nameInput.className = 'cat-name'; nameInput.value = cat.category || '';
  block.appendChild(nameLabel); block.appendChild(nameInput);

  const plansHolder = document.createElement('div');
  plansHolder.className = 'plans-holder';
  (cat.plans || []).forEach(p => plansHolder.appendChild(buildPlanBlock(p)));
  block.appendChild(plansHolder);

  const addPlanBtn = document.createElement('button');
  addPlanBtn.className = 'small-btn';
  addPlanBtn.type = 'button';
  addPlanBtn.textContent = '+ Add plan';
  addPlanBtn.style.marginTop = '14px';
  addPlanBtn.addEventListener('click', () => plansHolder.appendChild(buildPlanBlock({})));
  block.appendChild(addPlanBtn);

  return block;
}

function buildPlanBlock(plan) {
  const div = document.createElement('div');
  div.className = 'plan-block';
  div.innerHTML = `
    <div class="row2">
      <div><label>Plan name</label><input type="text" class="plan-name" value="${escapeAttr(plan.name || '')}"></div>
      <div><label>Price</label><input type="text" class="plan-price" value="${escapeAttr(plan.price || '')}"></div>
    </div>
    <div class="row2">
      <div><label>Period (e.g. / month)</label><input type="text" class="plan-period" value="${escapeAttr(plan.period || '')}"></div>
      <div class="checkbox-row" style="margin-top:30px;">
        <input type="checkbox" class="plan-highlight" ${plan.highlight ? 'checked' : ''}>
        <label>Mark as popular</label>
      </div>
    </div>
    <label>Features — one per line</label>
    <textarea class="plan-features" rows="3">${(plan.features || []).join('\n')}</textarea>
    <div style="margin-top:10px;">
      <button class="small-btn danger-btn" type="button">Remove plan</button>
    </div>
  `;
  div.querySelector('.danger-btn').addEventListener('click', () => div.remove());
  return div;
}

$('addCategoryBtn').addEventListener('click', () => {
  $('pricingEditor').appendChild(buildCategoryBlock({ category: '', plans: [] }, Date.now()));
});

function collectForm() {
  const data = { ...state.data };
  data.lastUpdated = new Date().toISOString();

  data.todayOffer = {
    tag: $('offerTag').value.trim(),
    title: $('offerTitle').value.trim(),
    description: $('offerDesc').value.trim()
  };

  data.ticker = $('tickerText').value.split('\n').map(s => s.trim()).filter(Boolean);

  data.gymInfo = {
    phone: $('giPhone').value.trim(),
    whatsapp: $('giWhatsapp').value.trim(),
    address: $('giAddress').value.trim(),
    mapLink: $('giMap').value.trim(),
    hours: $('giHours').value.split('\n').map(s => s.trim()).filter(Boolean).map(line => {
      const [days, time] = line.split('|').map(x => (x || '').trim());
      return { days, time };
    })
  };

  const categories = [];
  document.querySelectorAll('#pricingEditor .cat-block').forEach(catEl => {
    const category = catEl.querySelector('.cat-name').value.trim();
    const plans = [];
    catEl.querySelectorAll('.plan-block').forEach(planEl => {
      plans.push({
        name: planEl.querySelector('.plan-name').value.trim(),
        price: planEl.querySelector('.plan-price').value.trim(),
        period: planEl.querySelector('.plan-period').value.trim(),
        highlight: planEl.querySelector('.plan-highlight').checked,
        features: planEl.querySelector('.plan-features').value.split('\n').map(s => s.trim()).filter(Boolean)
      });
    });
    if (category) categories.push({ category, plans });
  });
  data.pricing = categories;

  return data;
}

$('saveBtn').addEventListener('click', async () => {
  const statusEl = $('statusMsg');
  statusEl.className = '';
  statusEl.textContent = 'Publishing…';

  const newData = collectForm();
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(newData, null, 2))));

  try {
    const res = await fetch(`https://api.github.com/repos/${state.owner}/${state.repo}/contents/data.json`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${state.token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Update pricing & offers — ${new Date().toLocaleString()}`,
        content,
        sha: state.sha,
        branch: state.branch
      })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `GitHub returned ${res.status}.`);
    }
    const result = await res.json();
    state.sha = result.content.sha;
    state.data = newData;
    statusEl.classList.add('ok');
    statusEl.textContent = 'Published. The live site will update within a minute or two.';
  } catch (err) {
    statusEl.classList.add('err');
    statusEl.textContent = 'Could not publish: ' + err.message;
  }
});

function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
