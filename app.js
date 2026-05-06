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
  selectedCountAdmin: $('selectedCountAdmin'),
  severityNowAdmin: $('severityNowAdmin'),
  categoryTotalAdmin: $('categoryTotalAdmin'),
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
  donutChart: $('donutChart'),
  analysisSummary: $('analysisSummary'),
  topCategoryList: $('topCategoryList'),
  comparisonSummary: $('comparisonSummary'),
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
  const q = normalizeName(refs.patientSearch ? refs.patientSearch.value : '').toLowerCase();
  return patientNames().filter(name => !q || name.toLowerCase().includes(q));
}

function renderPatientChips() {
  const names = filteredPatientNames();
  refs.savedPatients.innerHTML = '';
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
  if (refs.selectedCountAdmin) refs.selectedCountAdmin.textContent = count;
  if (refs.severityNowAdmin) refs.severityNowAdmin.textContent = currentSeverity(count);
  const categoryCount = categories.filter(c => getCategorySelectedCount(c) > 0).length;
  if (refs.categoryTotalAdmin) refs.categoryTotalAdmin.textContent = categoryCount;
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


function getCategoryBreakdown(selectedSet = state.selected){
  return categories.map(c => {
    const selected = c.items.filter(item => selectedSet.has(item)).length;
    return { name:c.name, selected, total:c.items.length, ratio:c.items.length ? selected / c.items.length : 0 };
  });
}

function buildSummaryText(breakdown, total){
  const active = breakdown.filter(x => x.selected > 0).sort((a,b) => b.selected - a.selected || b.ratio - a.ratio);
  if (!active.length) {
    return 'まだ選択項目がないため、自律神経との関連を含む詳細分析は表示されていません。';
  }
  const names = active.slice(0,3).map(v => `${v.name}（${v.selected}項目）`).join('、');
  const nervous = active.some(v => ['頭・神経系','睡眠','精神・感情'].includes(v.name));
  const body = active.some(v => ['心臓・血圧・循環','呼吸','消化器','皮膚・発汗','全身・体調'].includes(v.name));
  let relation = '自律神経の乱れは、全身の不調として現れやすい状態です。';
  if (nervous && body) relation = '頭・睡眠・感情面に加えて身体症状も出ており、自律神経のバランス低下が全身に影響している可能性があります。';
  else if (nervous) relation = '睡眠・頭・気分に関わる項目が目立ち、自律神経の緊張が続いている可能性があります。';
  else if (body) relation = '呼吸・循環・消化など身体面の反応が目立ち、自律神経の調整負担が高まっている可能性があります。';
  return `今回のチェックでは合計${total}項目が選択されています。特に ${names} の比重が高く、${relation}`;
}

function buildComparisonText(currentRecord, prevRecord){
  if (!prevRecord) {
    return '前回データがまだないため、今回は初回データとして記録されます。今後は自律神経の不調がどの領域で増減したかを比較できます。';
  }
  const diff = currentRecord.total - prevRecord.total;
  const direction = diff < 0 ? '減少' : diff > 0 ? '増加' : '同程度';
  const currentMap = Object.fromEntries((currentRecord.categoryCounts || []).map(v => [v.name, v.selected]));
  const prevMap = Object.fromEntries((prevRecord.categoryCounts || []).map(v => [v.name, v.selected]));
  const deltas = categories.map(c => ({ name:c.name, diff:(currentMap[c.name] || 0) - (prevMap[c.name] || 0) }))
    .filter(v => v.diff !== 0).sort((a,b) => Math.abs(b.diff) - Math.abs(a.diff));
  if (!deltas.length) {
    return `前回と比較すると合計チェック数は ${direction} で、自律神経に関わる症状の分布にも大きな変化はありません。`;
  }
  const main = deltas[0];
  const sign = main.diff > 0 ? '増え' : '減り';
  return `前回と比較すると合計チェック数は ${direction}（${diff > 0 ? '+' : ''}${diff}）です。特に ${main.name} が ${Math.abs(main.diff)}項目 ${sign}、自律神経の不調がこの領域で変化している可能性があります。`;
}

function renderTopCategoryList(breakdown){
  refs.topCategoryList.innerHTML = '';
  const active = breakdown.filter(x => x.selected > 0).sort((a,b) => b.selected - a.selected || b.ratio - a.ratio).slice(0,4);
  if (!active.length) {
    refs.topCategoryList.innerHTML = '<div class="top-category-item"><span>選択項目がまだありません。</span></div>';
    return;
  }
  active.forEach(item => {
    const el = document.createElement('div');
    el.className = 'top-category-item';
    const pct = Math.round(item.ratio * 100);
    let desc = '自律神経との関連を確認したい領域です。';
    if (['頭・神経系','睡眠','精神・感情'].includes(item.name)) desc = '自律神経の緊張や睡眠の質と関わりやすい領域です。';
    if (['心臓・血圧・循環','呼吸','消化器','全身・体調'].includes(item.name)) desc = '自律神経の調整低下が身体反応として出やすい領域です。';
    el.innerHTML = `<strong>${item.name}</strong><span>${item.selected} / ${item.total} 項目（比率 ${pct}%）</span><span>${desc}</span>`;
    refs.topCategoryList.appendChild(el);
  });
}

function drawDonutChart(currentRecord){
  const canvas = refs.donutChart;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 360;
  const cssHeight = cssWidth;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const cx = cssWidth / 2;
  const cy = cssHeight / 2;
  const outer = Math.min(cssWidth, cssHeight) * 0.34;
  const inner = outer * 0.58;
  const total = currentRecord.total || 0;
  const breakdown = getCategoryBreakdown(new Set(currentRecord.selectedItems || []));
  const active = breakdown.filter(v => v.selected > 0).sort((a,b) => b.selected - a.selected);
  const palette = ['#d9c17e','#b8933f','#f0d898','#9d7b31','#c9a85a','#e7d4a0','#8d6a22','#f4e7bd'];

  ctx.fillStyle = 'rgba(255,255,255,.06)';
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, Math.PI * 2);
  ctx.arc(cx, cy, inner, 0, Math.PI * 2, true);
  ctx.fill('evenodd');

  if (!active.length) {
    ctx.fillStyle = '#f5f0df';
    ctx.textAlign = 'center';
    ctx.font = '18px sans-serif';
    ctx.fillText('未選択', cx, cy - 6);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.72)';
    ctx.fillText('症状を選択すると分析が表示されます', cx, cy + 22);
    return;
  }

  let start = -Math.PI / 2;
  active.forEach((item, idx) => {
    const angle = (item.selected / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = palette[idx % palette.length];
    ctx.fill();
    start += angle;
  });

  ctx.fillStyle = 'rgba(0,0,0,.92)';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#d9c17e';
  ctx.font = '14px sans-serif';
  ctx.fillText('合計チェック数', cx, cy - 28);
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText(String(total), cx, cy + 14);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,.78)';
  ctx.fillText(currentSeverity(total), cx, cy + 42);

  const legendX = 18;
  let legendY = cssHeight - 18 - Math.min(active.length, 5) * 22;
  active.slice(0,5).forEach((item, idx) => {
    ctx.fillStyle = palette[idx % palette.length];
    ctx.fillRect(legendX, legendY - 10, 12, 12);
    ctx.fillStyle = '#f5f0df';
    ctx.textAlign = 'left';
    ctx.font = '13px sans-serif';
    ctx.fillText(`${item.name} ${item.selected}項目`, legendX + 20, legendY);
    legendY += 22;
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
      const currentRec = comp.current || createRecord();
      const breakdown = getCategoryBreakdown(new Set(currentRec.selectedItems || []));
      drawDonutChart(currentRec);
      refs.analysisSummary.textContent = buildSummaryText(breakdown, currentRec.total || 0);
      refs.comparisonSummary.textContent = buildComparisonText(currentRec, comp.prev);
      renderTopCategoryList(breakdown);
    } else {
      refs.prevDate.textContent = '-';
      refs.prevTotal.textContent = '-';
      refs.diffTotal.textContent = '-';
      refs.diffLabel.textContent = '初回';
      const currentRec = comp.current || createRecord();
      const breakdown = getCategoryBreakdown(new Set(currentRec.selectedItems || []));
      drawDonutChart(currentRec);
      refs.analysisSummary.textContent = buildSummaryText(breakdown, currentRec.total || 0);
      refs.comparisonSummary.textContent = buildComparisonText(currentRec, null);
      renderTopCategoryList(breakdown);
    }
  } else {
    refs.prevDate.textContent = '-';
    refs.prevTotal.textContent = '-';
    refs.diffTotal.textContent = '-';
    refs.diffLabel.textContent = '未保存';
    refs.historyMeta.textContent = '0件';
    refs.historyList.innerHTML = '<div class="history-row"><div class="history-meta">保存すると履歴が表示されます。</div></div>';
    const currentRec = createRecord();
    const breakdown = getCategoryBreakdown(new Set(currentRec.selectedItems || []));
    drawDonutChart(currentRec);
    refs.analysisSummary.textContent = buildSummaryText(breakdown, currentRec.total || 0);
    refs.comparisonSummary.textContent = buildComparisonText(currentRec, null);
    renderTopCategoryList(breakdown);
  }
}

function __unused_drawChart(currentRecord, prevRecord) {
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



function escapePrintHtml(value) {
  return String(value == null ? '' : value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setPrintText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value == null || value === '' ? '-' : String(value);
}


function drawPrintDonutChart(record) {
  const canvas = document.getElementById('printDonutChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const selectedSet = new Set((record && record.selectedItems) || []);
  const breakdown = getCategoryBreakdown(selectedSet).filter(v => v.selected > 0).sort((a,b) => b.selected - a.selected);
  const total = (record && record.total) || 0;
  const cx = width / 2;
  const cy = height / 2 - 8;
  const outer = Math.min(width, height) * 0.32;
  const inner = outer * 0.58;
  const shades = ['#222222','#555555','#777777','#999999','#b5b5b5','#cfcfcf','#e0e0e0','#eeeeee'];

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#111111';

  if (!breakdown.length || total === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = '20px sans-serif';
    ctx.fillText('未選択', cx, cy + 6);
    return;
  }

  let start = -Math.PI / 2;
  breakdown.forEach((item, idx) => {
    const angle = (item.selected / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = shades[idx % shades.length];
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    start += angle;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, Math.PI * 2);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#000000';
  ctx.font = '14px sans-serif';
  ctx.fillText('合計', cx, cy - 20);
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText(String(total), cx, cy + 18);
  ctx.font = '14px sans-serif';
  ctx.fillText(currentSeverity(total), cx, cy + 44);

  const legendStartY = height - 88;
  const legendX = 30;
  ctx.textAlign = 'left';
  breakdown.slice(0, 4).forEach((item, idx) => {
    const x = legendX + (idx % 2) * 190;
    const y = legendStartY + Math.floor(idx / 2) * 28;
    ctx.fillStyle = shades[idx % shades.length];
    ctx.fillRect(x, y - 12, 16, 16);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - 12, 16, 16);
    ctx.fillStyle = '#000000';
    ctx.font = '13px sans-serif';
    const label = `${item.name} ${item.selected}`;
    ctx.fillText(label, x + 22, y + 1);
  });
}

function renderPrintReport() {
  const name = normalizeName(refs.patientName.value);
  const currentRecord = createRecord();
  const selectedSet = new Set(currentRecord.selectedItems || []);
  const breakdown = getCategoryBreakdown(selectedSet);
  const activeBreakdown = breakdown.filter(v => v.selected > 0);
  const comp = name && state.patients[name] ? comparisonData(name, state.currentRecordId) : {prev:null, current:currentRecord};
  const prevRecord = comp && comp.prev ? comp.prev : null;
  const diff = prevRecord ? currentRecord.total - prevRecord.total : null;

  setPrintText('printName', name || '-');
  setPrintText('printDate', currentRecord.date || '-');
  setPrintText('printTotal', currentRecord.total || 0);
  setPrintText('printSeverity', currentSeverity(currentRecord.total || 0));
  setPrintText('printJudge', judgeText(currentRecord.total || 0));
  setPrintText('printAnalysisSummary', buildSummaryText(breakdown, currentRecord.total || 0));
  setPrintText('printPrevDate', prevRecord ? (prevRecord.date || '-') : '-');
  setPrintText('printPrevTotal', prevRecord ? prevRecord.total : '-');
  setPrintText('printDiffTotal', diff === null ? '-' : diffText(diff));
  setPrintText('printDiffLabel', diff === null ? '初回' : diffLabel(diff));
  setPrintText('printComparisonSummary', buildComparisonText(currentRecord, prevRecord));
  drawPrintDonutChart(currentRecord);

  const rows = document.getElementById('printCategoryRows');
  if (rows) {
    const list = activeBreakdown.length ? activeBreakdown : breakdown;
    rows.innerHTML = list.map(v => {
      const ratio = v.total ? Math.round((v.selected / v.total) * 100) : 0;
      return `<tr><td>${escapePrintHtml(v.name)}</td><td>${v.selected}項目</td><td>${v.total}項目中</td><td>${ratio}%</td></tr>`;
    }).join('');
  }

  const selectedWrap = document.getElementById('printSelectedItems');
  if (selectedWrap) {
    const selectedCategories = categories
      .map(c => ({ name:c.name, chosen:c.items.filter(item => selectedSet.has(item)) }))
      .filter(c => c.chosen.length > 0);

    if (!selectedCategories.length) {
      selectedWrap.innerHTML = '<div class="print-selected-group"><h3>未選択</h3><p>選択された項目はありません。</p></div>';
    } else {
      selectedWrap.innerHTML = selectedCategories.map(c => `
        <div class="print-selected-group">
          <h3>${escapePrintHtml(c.name)}（${c.chosen.length}項目）</h3>
          <ul>${c.chosen.map(item => `<li>${escapePrintHtml(item)}</li>`).join('')}</ul>
        </div>
      `).join('');
    }
  }
}

refs.saveBtn.addEventListener('click', saveCurrentPatient);
refs.exportBtn.addEventListener('click', exportJson);
refs.importBtn.addEventListener('click', () => refs.importFile.click());
refs.importFile.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) importJson(file);
  e.target.value = '';
});
if (refs.patientSearch) refs.patientSearch.addEventListener('input', renderPatientChips);
refs.resultBtn.addEventListener('click', () => {
  renderResult();
  refs.resultSection.hidden = false;
  refs.resultSection.scrollIntoView({behavior: 'smooth', block: 'start'});
});
refs.resetBtn.addEventListener('click', resetForNew);
refs.deleteCurrentBtn.addEventListener('click', deleteCurrentRecord);
refs.backBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
refs.printBtn.addEventListener('click', () => { renderResult(); renderPrintReport(); window.print(); });
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


/* ===== isolated admin lock verified ===== */
(function(){
  const ADMIN_PASSWORD = 'gene2026';
  const ADMIN_UNLOCK_MS = 1000 * 60 * 30;
  const refs2 = {
    adminToolbar: document.getElementById('adminToolbar'),
    adminButtons: document.getElementById('adminButtons'),
    resultBtn: document.getElementById('resultBtn'),
    adminPassword: document.getElementById('adminPassword'),
    adminUnlockBtn: document.getElementById('adminUnlockBtn'),
    adminLogoutBtn: document.getElementById('adminLogoutBtn'),
    adminLockedView: document.getElementById('adminLockedView'),
    adminAuthStatus: document.getElementById('adminAuthStatus'),
  adminSummary: document.getElementById('adminSummary'),
    statusText: document.getElementById('statusText')
  };
  if(Object.values(refs2).some(v => v === null)) return;
  function key(){ return 'gene_admin_unlock_until_verified_v2'; }
  function isUnlocked(){ return Number(localStorage.getItem(key()) || 0) > Date.now(); }
  function show(){
    refs2.adminSummary.hidden = false;
    if (refs2.adminSummary) refs2.adminSummary.hidden = false;
    if (refs2.adminSummary) { refs2.adminSummary.hidden = false; refs2.adminSummary.classList.add('admin-visible'); }
    refs2.adminToolbar.hidden = false;
    refs2.adminButtons.hidden = false;
    refs2.resultBtn.hidden = false;
    refs2.adminSummary.classList.add('admin-visible');
    if (refs2.adminSummary) refs2.adminSummary.classList.add('admin-visible');
    refs2.adminToolbar.classList.add('admin-visible');
    refs2.adminButtons.classList.add('admin-visible');
    refs2.resultBtn.classList.add('admin-visible');
    refs2.adminLockedView.hidden = true;
    refs2.adminLogoutBtn.hidden = false;
    refs2.adminLogoutBtn.classList.remove('hidden');
    refs2.adminAuthStatus.textContent = '管理者メニューを開きました。';
  }
  function hide(){
    refs2.adminSummary.hidden = true;
    if (refs2.adminSummary) refs2.adminSummary.hidden = true;
    if (refs2.adminSummary) { refs2.adminSummary.hidden = true; refs2.adminSummary.classList.remove('admin-visible'); }
    refs2.adminToolbar.hidden = true;
    refs2.adminButtons.hidden = true;
    refs2.resultBtn.hidden = true;
    refs2.adminSummary.classList.remove('admin-visible');
    if (refs2.adminSummary) refs2.adminSummary.classList.remove('admin-visible');
    refs2.adminToolbar.classList.remove('admin-visible');
    refs2.adminButtons.classList.remove('admin-visible');
    refs2.resultBtn.classList.remove('admin-visible');
    refs2.adminLockedView.hidden = false;
    refs2.adminLogoutBtn.hidden = true;
    refs2.adminLogoutBtn.classList.add('hidden');
    refs2.adminAuthStatus.textContent = 'ロック中';
  }
  function apply(){ if(isUnlocked()) show(); else hide(); }
  refs2.adminUnlockBtn.addEventListener('click', function(){
    const value = (refs2.adminPassword.value || '').trim();
    if(value === ADMIN_PASSWORD){
      localStorage.setItem(key(), String(Date.now() + ADMIN_UNLOCK_MS));
      refs2.adminPassword.value = '';
      show();
      if(refs2.statusText) refs2.statusText.textContent = '管理者メニューを開きました。';
    } else {
      refs2.adminAuthStatus.textContent = 'パスワードが違います。';
      refs2.adminPassword.value = '';
      refs2.adminPassword.focus();
    }
  });
  refs2.adminPassword.addEventListener('keydown', function(e){ if(e.key === 'Enter') refs2.adminUnlockBtn.click(); });
  refs2.adminLogoutBtn.addEventListener('click', function(){
    localStorage.removeItem(key());
    hide();
    if(refs2.statusText) refs2.statusText.textContent = '管理者メニューを閉じました。';
  });
  apply();
  window.addEventListener('pageshow', apply);
})();


// final runtime marker
try { console.log('gene admin lock final fix loaded'); } catch (e) {}
