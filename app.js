const categories = [{"name": "全身・体調", "items": ["慢性的に疲れやすい", "休んでも疲れが取れない", "朝起きるのがつらい", "体が重だるい", "微熱が続くことがある", "のぼせやすい", "手足や体が冷えやすい", "寒暖差に弱い", "記憶力が低下している気がする"]}, {"name": "心臓・血圧・循環", "items": ["動悸がする", "脈が乱れる感じがある", "胸が苦しくなることがある", "息切れしやすい", "血圧が不安定だと感じる"]}, {"name": "消化器", "items": ["食欲がない", "食欲が出すぎる", "胃もたれしやすい", "胃の不快感がある", "吐き気を感じることがある", "お腹が張りやすい", "便秘になりやすい", "下痢をしやすい", "便秘と下痢を繰り返す"]}, {"name": "呼吸", "items": ["息が吸いにくい", "深呼吸がしづらい", "息苦しさを感じることがある"]}, {"name": "頭・神経系", "items": ["頭痛がする", "頭が締め付けられる感じがする", "頭がぼーっとする", "集中力が続かない", "めまいがする", "立ちくらみがある", "ふらつく感じがある", "耳鳴りがする"]}, {"name": "睡眠", "items": ["寝つきが悪い", "夜中に目が覚める", "朝早く目が覚めてしまう", "眠りが浅い", "夢をよく見る", "寝てもスッキリしない"]}, {"name": "筋肉・関節", "items": ["首こりがある", "肩こりがある", "背中が張りやすい", "腰に違和感がある", "体がこわばりやすい", "手足がしびれることがある", "筋肉がピクピク動くことがある"]}, {"name": "精神・感情", "items": ["不安を感じやすい", "理由のない緊張感がある", "イライラしやすい", "気分が落ち込みやすい", "気持ちの波が大きい", "人前で緊張しやすい", "外出が不安になることがある"]}, {"name": "目・口・喉", "items": ["目が疲れやすい", "目が乾く", "光がまぶしく感じる", "口が渇きやすい", "喉が詰まる感じがする", "飲み込みにくさを感じる"]}, {"name": "排尿・生理", "items": ["トイレが近い", "残尿感がある", "排尿しづらい感じがある", "生理周期が乱れやすい", "生理痛が強い", "生理前に体調が大きく崩れる"]}, {"name": "皮膚・発汗", "items": ["汗をかきやすい", "汗をかきにくい", "寝汗をかく", "手汗・足汗が気になる", "皮膚がかゆくなりやすい", "湿疹や肌荒れが出やすい", "肌が乾燥しやすい", "浸出液が出る", "皮膚がポロポロと落ちる", "顔がほてりやすい"]}, {"name": "感覚・その他", "items": ["音に敏感", "光に敏感", "匂いに敏感", "乗り物酔いしやすい", "天候や気圧の変化で体調が変わる", "季節の変わり目に不調が出やすい"]}];

const state = {
  selected: new Set(),
  patients: {},
  activePatient: '',
  currentRecordId: null,
  installPrompt: null
};

const $ = (id) => document.getElementById(id);
const refs = {
  patientName: $('patientName'),
  visitDate: $('visitDate'),
  patientSearch: $('patientSearch'),
  savedPatients: $('savedPatients'),
  savedCount: $('savedCount'),
  selectedCount: $('selectedCount'),
  severityNow: $('severityNow'),
  categoryTotal: $('categoryTotal'),
  statusText: $('statusText'),
  metaText: $('metaText'),
  categoryContainer: $('categoryContainer'),
  saveBtn: $('saveBtn'),
  exportBtn: $('exportBtn'),
  importBtn: $('importBtn'),
  importFile: $('importFile'),
  installBtn: $('installBtn'),
  resetBtn: $('resetBtn'),
  resultBtn: $('resultBtn'),
  resultSection: $('resultSection'),
  resultName: $('resultName'),
  resultDate: $('resultDate'),
  resultTotal: $('resultTotal'),
  resultSeverity: $('resultSeverity'),
  prevDate: $('prevDate'),
  prevTotal: $('prevTotal'),
  diffTotal: $('diffTotal'),
  diffLabel: $('diffLabel'),
  judgeComment: $('judgeComment'),
  barChart: $('barChart'),
  historyList: $('historyList'),
  historyMeta: $('historyMeta'),
  selectedList: $('selectedList'),
  selectedMeta: $('selectedMeta'),
  deleteCurrentBtn: $('deleteCurrentBtn'),
  backBtn: $('backBtn'),
  printBtn: $('printBtn')
};

function todayText() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function storageKey() {
  return 'gene_monshin_compare_app_v1';
}

function draftKey() {
  return 'gene_monshin_compare_draft_v1';
}

function saveAll() {
  localStorage.setItem(storageKey(), JSON.stringify(state.patients));
  saveDraft();
}

function saveDraft() {
  const payload = {
    name: refs.patientName.value,
    date: refs.visitDate.value,
    selected: Array.from(state.selected),
    activePatient: state.activePatient,
    currentRecordId: state.currentRecordId
  };
  localStorage.setItem(draftKey(), JSON.stringify(payload));
}

function loadAll() {
  try {
    state.patients = JSON.parse(localStorage.getItem(storageKey()) || '{}');
  } catch (e) {
    state.patients = {};
  }
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey()) || 'null');
    if (draft) {
      refs.patientName.value = draft.name || '';
      refs.visitDate.value = draft.date || todayText();
      state.selected = new Set(draft.selected || []);
      state.activePatient = draft.activePatient || '';
      state.currentRecordId = draft.currentRecordId || null;
    }
  } catch (e) {}
}

function totalItemCount() {
  return categories.reduce((sum, c) => sum + c.items.length, 0);
}

function getCategorySelectedCount(category, selectedSet = state.selected) {
  return category.items.filter(item => selectedSet.has(item)).length;
}

function currentSeverity(count) {
  if (count <= 8) return '軽度';
  if (count <= 18) return '中度';
  return '重度';
}

function judgeText(count) {
  if (count <= 8) return '選択数は少なめです。現在の状態を丁寧に確認しながら進めます。';
  if (count <= 18) return '複数の不調が重なっています。身体の反応と生活背景を整理しながら全体を見ていきます。';
  return '不調の範囲が広く、負担が積み重なっている可能性があります。優先順位を決めながら無理のない形で確認します。';
}

function setStatus(text) {
  refs.statusText.textContent = text;
}

function normalizeName(name) {
  return (name || '').trim();
}

function sortRecords(records) {
  return [...records].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0) || (b.createdAt || 0) - (a.createdAt || 0));
}

function ensurePatient(name) {
  if (!state.patients[name]) state.patients[name] = [];
}

function patientNames() {
  return Object.keys(state.patients).sort((a,b) => a.localeCompare(b, 'ja'));
}

function filteredPatientNames() {
  const q = normalizeName(refs.patientSearch.value).toLowerCase();
  return patientNames().filter(name => !q || name.toLowerCase().includes(q));
}

function renderPatientChips() {
  const names = filteredPatientNames();
  refs.savedPatients.innerHTML = '';
  refs.savedCount.textContent = `${patientNames().length}名`;
  if (!names.length) {
    refs.savedPatients.innerHTML = '<span class="history-meta">保存済み患者はまだありません。</span>';
    return;
  }
  names.forEach(name => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'patient-chip' + (state.activePatient === name ? ' active' : '');
    btn.textContent = name;
    btn.addEventListener('click', () => loadLatestPatient(name));
    refs.savedPatients.appendChild(btn);
  });
}

function renderCategories() {
  refs.categoryContainer.innerHTML = '';
  categories.forEach((category) => {
    const wrap = document.createElement('section');
    wrap.className = 'category-card';

    const top = document.createElement('div');
    top.className = 'category-top';
    top.innerHTML = `<h3>${category.name}</h3><div class="category-meta">${getCategorySelectedCount(category)} / ${category.items.length}</div>`;
    wrap.appendChild(top);

    const grid = document.createElement('div');
    grid.className = 'item-grid';

    category.items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'item-btn';
      btn.textContent = item;
      if (state.selected.has(item)) btn.classList.add('active');

      btn.addEventListener('click', () => {
        if (state.selected.has(item)) {
          state.selected.delete(item);
          btn.classList.remove('active');
        } else {
          state.selected.add(item);
          btn.classList.add('active');
        }
        top.querySelector('.category-meta').textContent = `${getCategorySelectedCount(category)} / ${category.items.length}`;
        updateHeader();
        saveDraft();
      });

      grid.appendChild(btn);
    });

    wrap.appendChild(grid);
    refs.categoryContainer.appendChild(wrap);
  });
}

function updateHeader() {
  const count = state.selected.size;
  refs.selectedCount.textContent = count;
  refs.severityNow.textContent = currentSeverity(count);
  refs.categoryTotal.textContent = categories.filter(c => getCategorySelectedCount(c) > 0).length;
  refs.metaText.textContent = `${categories.length}カテゴリ / 82項目`;
}

function createRecord() {
  return {
    id: state.currentRecordId || `r_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    date: refs.visitDate.value || todayText(),
    total: state.selected.size,
    severity: currentSeverity(state.selected.size),
    selectedItems: Array.from(state.selected),
    categoryCounts: categories.map(c => ({
      name: c.name,
      selected: c.items.filter(item => state.selected.has(item)).length,
      total: c.items.length
    })),
    createdAt: Date.now()
  };
}

function saveCurrentPatient() {
  const name = normalizeName(refs.patientName.value);
  if (!name) {
    setStatus('保存するにはお名前が必要です。');
    refs.patientName.focus();
    return;
  }
  ensurePatient(name);
  const record = createRecord();
  const records = state.patients[name];
  const index = records.findIndex(r => r.id === record.id);
  if (index >= 0) {
    records[index] = record;
    setStatus(`「${name}」の今回データを更新しました。`);
  } else {
    records.push(record);
    setStatus(`「${name}」のデータを保存しました。`);
  }
  state.activePatient = name;
  state.currentRecordId = record.id;
  saveAll();
  renderPatientChips();
  renderResult();
  refs.resultSection.hidden = false;
}

function loadRecord(name, recordId) {
  const records = sortRecords(state.patients[name] || []);
  const record = records.find(r => r.id === recordId);
  if (!record) return;
  refs.patientName.value = name;
  refs.visitDate.value = record.date || todayText();
  state.selected = new Set(record.selectedItems || []);
  state.activePatient = name;
  state.currentRecordId = record.id;
  renderCategories();
  updateHeader();
  renderResult();
  refs.resultSection.hidden = false;
  saveDraft();
  renderPatientChips();
  setStatus(`「${name}」の保存データを読み込みました。`);
}

function loadLatestPatient(name) {
  const records = sortRecords(state.patients[name] || []);
  if (!records.length) return;
  loadRecord(name, records[0].id);
}

function comparisonData(name, recordId) {
  const records = sortRecords(state.patients[name] || []);
  const currentIndex = records.findIndex(r => r.id === recordId);
  if (currentIndex < 0) return { current: null, prev: null, records };
  return {
    current: records[currentIndex],
    prev: records[currentIndex + 1] || null,
    records
  };
}

function diffLabel(diff) {
  if (diff === null) return '初回';
  if (diff < 0) return '前回より減少';
  if (diff > 0) return '前回より増加';
  return '前回と同数';
}

function diffText(diff) {
  if (diff === null) return '-';
  if (diff > 0) return `+${diff}`;
  return String(diff);
}

function renderHistory(name, currentId) {
  const records = sortRecords(state.patients[name] || []);
  refs.historyMeta.textContent = `${records.length}件`;
  refs.historyList.innerHTML = '';
  if (!records.length) {
    refs.historyList.innerHTML = '<div class="history-row"><div class="history-meta">保存履歴はまだありません。</div></div>';
    return;
  }
  records.forEach(record => {
    const row = document.createElement('div');
    row.className = 'history-row';
    const isCurrent = record.id === currentId;
    row.innerHTML = `
      <div class="history-top">
        <div>
          <h4>${record.date || '-'}${isCurrent ? '（表示中）' : ''}</h4>
          <div class="history-meta">選択数：${record.total} / 判定：${record.severity}</div>
        </div>
        <button type="button" class="patient-chip${isCurrent ? ' active' : ''}">読み込む</button>
      </div>
    `;
    row.querySelector('button').addEventListener('click', () => loadRecord(name, record.id));
    refs.historyList.appendChild(row);
  });
}

function renderSelectedList(selectedSet = state.selected) {
  const selectedCategories = categories
    .map(c => ({...c, chosen: c.items.filter(item => selectedSet.has(item))}))
    .filter(c => c.chosen.length > 0);

  refs.selectedList.innerHTML = '';
  refs.selectedMeta.textContent = `${selectedSet.size}件`;

  if (!selectedCategories.length) {
    refs.selectedList.innerHTML = '<div class="selected-group"><h4>未選択</h4><div>まだ選択されていません。</div></div>';
    return;
  }

  selectedCategories.forEach(c => {
    const block = document.createElement('div');
    block.className = 'selected-group';
    block.innerHTML = `<h4>${c.name}</h4><ul>${c.chosen.map(v => `<li>${v}</li>`).join('')}</ul>`;
    refs.selectedList.appendChild(block);
  });
}

function renderResult() {
  const count = state.selected.size;
  const name = normalizeName(refs.patientName.value);
  refs.resultName.textContent = name || '-';
  refs.resultDate.textContent = refs.visitDate.value || '-';
  refs.resultTotal.textContent = count;
  refs.resultSeverity.textContent = currentSeverity(count);
  refs.judgeComment.textContent = judgeText(count);

  renderSelectedList(state.selected);

  if (name && state.patients[name]) {
    renderHistory(name, state.currentRecordId);
    const comp = comparisonData(name, state.currentRecordId);
    if (comp.prev) {
      refs.prevDate.textContent = comp.prev.date || '-';
      refs.prevTotal.textContent = comp.prev.total;
      const diff = count - comp.prev.total;
      refs.diffTotal.textContent = diffText(diff);
      refs.diffLabel.textContent = diffLabel(diff);
      drawChart(comp.current || createRecord(), comp.prev);
    } else {
      refs.prevDate.textContent = '-';
      refs.prevTotal.textContent = '-';
      refs.diffTotal.textContent = '-';
      refs.diffLabel.textContent = '初回';
      drawChart(comp.current || createRecord(), null);
    }
  } else {
    refs.prevDate.textContent = '-';
    refs.prevTotal.textContent = '-';
    refs.diffTotal.textContent = '-';
    refs.diffLabel.textContent = '未保存';
    refs.historyMeta.textContent = '0件';
    refs.historyList.innerHTML = '<div class="history-row"><div class="history-meta">保存すると履歴が表示されます。</div></div>';
    drawChart(createRecord(), null);
  }
}

function drawChart(currentRecord, prevRecord) {
  const canvas = refs.barChart;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 900;
  const rowHeight = 52;
  const cssHeight = Math.max(560, categories.length * rowHeight + 100);
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const margin = {top: 28, right: 80, bottom: 24, left: 170};
  const plotWidth = cssWidth - margin.left - margin.right;

  const currentMap = Object.fromEntries((currentRecord.categoryCounts || []).map(v => [v.name, v.selected]));
  const prevMap = Object.fromEntries(((prevRecord && prevRecord.categoryCounts) || []).map(v => [v.name, v.selected]));

  categories.forEach((c, i) => {
    const y = margin.top + i * rowHeight;
    const total = c.items.length;
    const curr = currentMap[c.name] || 0;
    const prev = prevMap[c.name] || 0;
    const bgH = 28;

    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = '14px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.name, 12, y + 14);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, margin.left, y, plotWidth, bgH, 10);
    ctx.fill();

    const prevW = total ? plotWidth * (prev / total) : 0;
    if (prevRecord && prevW > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      roundRect(ctx, margin.left, y + 4, prevW, bgH - 8, 8);
      ctx.fill();
    }

    const currW = total ? plotWidth * (curr / total) : 0;
    if (currW > 0) {
      const grad = ctx.createLinearGradient(margin.left, y, margin.left + currW, y);
      grad.addColorStop(0, '#d9c17e');
      grad.addColorStop(1, '#b8933f');
      ctx.fillStyle = grad;
      roundRect(ctx, margin.left, y + 2, currW, bgH - 4, 8);
      ctx.fill();
    }

    ctx.fillStyle = '#f5f0df';
    const label = prevRecord ? `${curr} / ${prev} / ${total}` : `${curr} / ${total}`;
    ctx.fillText(label, margin.left + plotWidth + 10, y + 14);
  });
}

function roundRect(ctx, x, y, w, h, r) {
  if (w <= 0) return;
  const radius = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function resetForNew() {
  refs.patientName.value = '';
  refs.visitDate.value = todayText();
  state.selected = new Set();
  state.activePatient = '';
  state.currentRecordId = null;
  refs.resultSection.hidden = true;
  renderCategories();
  updateHeader();
  renderPatientChips();
  saveDraft();
  setStatus('新規入力に切り替えました。');
}

function deleteCurrentRecord() {
  const name = normalizeName(refs.patientName.value);
  if (!name || !state.currentRecordId || !state.patients[name]) {
    setStatus('削除対象の保存データがありません。');
    return;
  }
  state.patients[name] = (state.patients[name] || []).filter(r => r.id !== state.currentRecordId);
  if (!state.patients[name].length) delete state.patients[name];
  state.currentRecordId = null;
  state.activePatient = name;
  saveAll();
  renderPatientChips();
  renderResult();
  setStatus(`「${name}」の表示中データを削除しました。`);
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state.patients, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = todayText().replaceAll('-', '');
  a.href = url;
  a.download = `gene_monshin_backup_${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
  setStatus('JSONバックアップを書き出しました。');
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (typeof data !== 'object' || Array.isArray(data) || data === null) throw new Error('invalid');
      state.patients = data;
      saveAll();
      renderPatientChips();
      renderResult();
      setStatus('JSONバックアップを読み込みました。');
    } catch (e) {
      setStatus('JSON読み込みに失敗しました。');
    }
  };
  reader.readAsText(file, 'utf-8');
}

refs.saveBtn.addEventListener('click', saveCurrentPatient);
refs.exportBtn.addEventListener('click', exportJson);
refs.importBtn.addEventListener('click', () => refs.importFile.click());
refs.importFile.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) importJson(file);
  e.target.value = '';
});
refs.patientSearch.addEventListener('input', renderPatientChips);
refs.resultBtn.addEventListener('click', () => {
  renderResult();
  refs.resultSection.hidden = false;
  refs.resultSection.scrollIntoView({behavior: 'smooth', block: 'start'});
});
refs.resetBtn.addEventListener('click', resetForNew);
refs.deleteCurrentBtn.addEventListener('click', deleteCurrentRecord);
refs.backBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
refs.printBtn.addEventListener('click', () => window.print());
refs.patientName.addEventListener('input', () => {
  state.activePatient = normalizeName(refs.patientName.value);
  saveDraft();
});
refs.visitDate.addEventListener('change', saveDraft);
window.addEventListener('resize', () => {
  if (!refs.resultSection.hidden) renderResult();
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  state.installPrompt = e;
  refs.installBtn.classList.remove('hidden');
});
refs.installBtn.addEventListener('click', async () => {
  if (!state.installPrompt) return;
  state.installPrompt.prompt();
  await state.installPrompt.userChoice;
  state.installPrompt = null;
  refs.installBtn.classList.add('hidden');
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

refs.visitDate.value = todayText();
loadAll();
if (!refs.visitDate.value) refs.visitDate.value = todayText();
renderCategories();
updateHeader();
renderPatientChips();
setStatus('保存機能・前回比較機能付きで起動しました。');





const ADMIN_PASSWORD = 'gene2026';
const ADMIN_UNLOCK_MS = 1000 * 60 * 30;

function adminStorageKey() {
  return 'gene_admin_unlock_until_v2';
}

function isAdminUnlocked() {
  const until = Number(localStorage.getItem(adminStorageKey()) || 0);
  return until > Date.now();
}

function setAdminUnlocked(flag) {
  if (flag) {
    localStorage.setItem(adminStorageKey(), String(Date.now() + ADMIN_UNLOCK_MS));
  } else {
    localStorage.removeItem(adminStorageKey());
  }
  applyAdminVisibility();
}

function applyAdminVisibility() {
  const unlocked = isAdminUnlocked();
  const adminToolbar = document.getElementById('adminToolbar');
  const adminButtons = document.getElementById('adminButtons');
  const lockedView = document.getElementById('adminLockedView');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  if (adminToolbar) {
    adminToolbar.hidden = !unlocked;
    adminToolbar.classList.toggle('admin-visible', unlocked);
  }
  if (adminButtons) {
    adminButtons.hidden = !unlocked;
    adminButtons.classList.toggle('admin-visible', unlocked);
  }
  if (lockedView) {
    lockedView.hidden = unlocked;
  }
  if (logoutBtn) {
    logoutBtn.hidden = !unlocked;
  }

  const status = document.getElementById('adminAuthStatus');
  if (status && !unlocked) status.textContent = 'ロック中';
}

function initAdminLock() {
  const passwordInput = document.getElementById('adminPassword');
  const unlockBtn = document.getElementById('adminUnlockBtn');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  const status = document.getElementById('adminAuthStatus');

  if (!passwordInput || !unlockBtn || !logoutBtn) {
    console.warn('admin lock elements not found');
    return;
  }

  function unlockNow() {
    const value = (passwordInput.value || '').trim();
    if (value === ADMIN_PASSWORD) {
      setAdminUnlocked(true);
      passwordInput.value = '';
      if (status) status.textContent = '管理者メニューを開きました。';
      if (typeof setStatus === 'function') setStatus('管理者メニューを開きました。');
    } else {
      if (status) status.textContent = 'パスワードが違います。';
      passwordInput.value = '';
      passwordInput.focus();
    }
  }

  unlockBtn.addEventListener('click', unlockNow);
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') unlockNow();
  });
  logoutBtn.addEventListener('click', () => {
    setAdminUnlocked(false);
    if (typeof setStatus === 'function') setStatus('管理者メニューを閉じました。');
  });

  applyAdminVisibility();
}

window.addEventListener('load', initAdminLock);
