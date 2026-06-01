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


/* =====================================================
   gene advanced clinical / TCM / lifestyle report
   HP症状ページ・生活資料連動版
===================================================== */
(function(){
  const GENE_HP_BASE = 'https://gene-seitai.com/';
  const HP_SYMPTOMS = [
    {name:'アトピー', url:'atopy.html', keys:['皮膚がかゆくなりやすい','湿疹や肌荒れが出やすい','肌が乾燥しやすい','浸出液が出る','皮膚がポロポロと落ちる']},
    {name:'耳鳴り', url:'tinnitus.html', keys:['耳鳴りがする','音に敏感']},
    {name:'めまい', url:'dizziness.html', keys:['めまいがする','立ちくらみがある','ふらつく感じがある','乗り物酔いしやすい','血圧が不安定だと感じる']},
    {name:'不眠', url:'insomnia.html', keys:['寝つきが悪い','夜中に目が覚める','朝早く目が覚めてしまう','眠りが浅い','夢をよく見る','寝てもスッキリしない']},
    {name:'頭痛', url:'headache.html', keys:['頭痛がする','頭が締め付けられる感じがする','目が疲れやすい','光がまぶしく感じる','肩こりがある','首こりがある']},
    {name:'動悸', url:'palpitations.html', keys:['動悸がする','脈が乱れる感じがある','胸が苦しくなることがある','血圧が不安定だと感じる']},
    {name:'慢性疲労', url:'chronic-fatigue.html', keys:['慢性的に疲れやすい','休んでも疲れが取れない','朝起きるのがつらい','体が重だるい']},
    {name:'パニック症状', url:'panic.html', keys:['外出が不安になることがある','人前で緊張しやすい','理由のない緊張感がある','息苦しさを感じることがある','動悸がする']},
    {name:'不安障害', url:'anxiety-disorder.html', keys:['不安を感じやすい','理由のない緊張感がある','気持ちの波が大きい','外出が不安になることがある']},
    {name:'吐き気', url:'nausea.html', keys:['吐き気を感じることがある','胃の不快感がある','食欲がない','お腹が張りやすい']},
    {name:'胃の不快感', url:'stomach-discomfort.html', keys:['胃もたれしやすい','胃の不快感がある','食欲がない','吐き気を感じることがある']},
    {name:'PMS', url:'pms.html', keys:['生理前に体調が大きく崩れる','生理周期が乱れやすい','生理痛が強い','気持ちの波が大きい']},
    {name:'冷え性', url:'cold.html', keys:['手足や体が冷えやすい','寒暖差に弱い','のぼせやすい','血圧が不安定だと感じる']},
    {name:'自律神経失調症', url:'autonomic-imbalance.html', keys:['眠りが浅い','動悸がする','息苦しさを感じることがある','めまいがする','体が重だるい','不安を感じやすい']},
    {name:'足底筋膜炎', url:'plantar-fasciitis.html', keys:['足底筋膜炎','体がこわばりやすい']},
    {name:'顎関節症', url:'tmj.html', keys:['顎関節症','頭が締め付けられる感じがする','首こりがある']},
    {name:'腱鞘炎', url:'tenosynovitis.html', keys:['腱鞘炎','手足がしびれることがある','筋肉がピクピク動くことがある']},
    {name:'起立性調節障害', url:'orthostatic-dysregulation.html', keys:['立ちくらみがある','朝起きるのがつらい','めまいがする','血圧が不安定だと感じる','体が重だるい']},
    {name:'過敏性腸症候群', url:'ibs.html', keys:['便秘と下痢を繰り返す','下痢をしやすい','便秘になりやすい','お腹が張りやすい']},
    {name:'慢性便秘', url:'chronic-constipation.html', keys:['便秘になりやすい','お腹が張りやすい','食欲がない']},
    {name:'息苦しさ', url:'shortness-of-breath.html', keys:['息が吸いにくい','深呼吸がしづらい','息苦しさを感じることがある','胸が苦しくなることがある']},
    {name:'喉の違和感', url:'throat-discomfort.html', keys:['喉が詰まる感じがする','飲み込みにくさを感じる','口が渇きやすい','理由のない緊張感がある']}
  ];

  const CATEGORY_MEDICAL = {
    '全身・体調': {type:'HPA軸負荷・慢性疲労型', tcm:'気虚・陽虚・腎虚傾向', body:'胸郭、横隔膜、骨盤帯、下肢循環', point:'慢性的な交感神経賦活と回復反応の低下を考え、呼吸運動と循環を妨げる筋膜緊張を優先して確認します。'},
    '心臓・血圧・循環': {type:'循環調節不安定型', tcm:'心気虚・心血不足・気逆傾向', body:'胸郭前面、肋間、鎖骨下、頸部前面、上部胸椎', point:'動悸や血圧変動は循環調節と呼吸パターンの影響を受けやすいため、胸郭の可動性と頸胸移行部の緊張を確認します。'},
    '消化器': {type:'腸管神経叢・迷走神経負担型', tcm:'脾胃虚弱・肝脾不和・湿滞傾向', body:'横隔膜、肋骨弓、腹部、骨盤、腰背部', point:'胃腸症状は迷走神経・腸内環境・腹圧の影響を受けやすいため、横隔膜と腹部の滑走性を丁寧に確認します。'},
    '呼吸': {type:'呼吸運動制限・過換気傾向型', tcm:'肺気虚・気滞・上焦の緊張', body:'横隔膜、肋間筋、胸鎖乳突筋、斜角筋、胸椎', point:'呼吸の浅さは胸郭と頸部補助呼吸筋の過緊張が関与しやすいため、呼気が自然に長くなる身体条件を整えます。'},
    '頭・神経系': {type:'前庭神経・頸性緊張・感覚過敏型', tcm:'肝陽上亢・肝血虚・腎虚傾向', body:'後頭下筋群、頸椎、側頭部、顎、眼周囲', point:'めまい・頭痛・耳鳴りは頸部緊張、眼精疲労、前庭系の過敏性と関わりやすいため、後頭下筋群と頭頸部の負担を確認します。'},
    '睡眠': {type:'睡眠覚醒リズム低下型', tcm:'心脾両虚・陰虚火旺・肝鬱化火傾向', body:'頭部、頸部、胸郭、腹部、仙骨周囲', point:'入眠困難や中途覚醒は交感神経優位が続く時に出やすいため、頸部・胸郭・腹部の緊張を下げる方向で見立てます。'},
    '筋肉・関節': {type:'筋膜緊張・防御収縮型', tcm:'気滞血瘀・寒湿・経絡不通傾向', body:'頸肩背部、胸腰筋膜、骨盤帯、下肢', point:'慢性的な筋緊張は痛みの部位だけでなく呼吸・循環・姿勢保持の影響を受けるため、全身の連動性を見ます。'},
    '精神・感情': {type:'情動系過覚醒・辺縁系緊張型', tcm:'肝鬱気滞・心神不安・肝火上炎傾向', body:'胸郭、みぞおち、頸部、側頭部、腹部', point:'不安や緊張は胸郭の硬さ、呼吸の浅さ、みぞおちの緊張と連動しやすいため、身体側から安心しやすい条件を作ります。'},
    '目・口・喉': {type:'上咽頭・頸部緊張・感覚過敏型', tcm:'肝鬱気滞・肺陰虚・痰気交阻傾向', body:'舌骨周囲、前頸部、顎、後頭部、胸郭上部', point:'喉の違和感や口渇は頸部前面・呼吸・自律神経緊張の影響を受けやすく、首の前後の緊張差を確認します。'},
    '排尿・生理': {type:'骨盤内循環・内分泌リズム負担型', tcm:'腎虚・肝鬱・瘀血傾向', body:'下腹部、仙骨、骨盤底、股関節、腰部', point:'排尿や月経関連の不調は骨盤内循環と自律神経の切り替えが関係しやすいため、骨盤周囲と下腹部の緊張を確認します。'},
    '皮膚・発汗': {type:'皮膚バリア・免疫過敏・発汗調節型', tcm:'肺脾気虚・血虚風燥・湿熱傾向', body:'胸郭、腹部、背部、頸部、皮膚緊張部位', point:'皮膚症状や発汗異常は免疫・腸・自律神経の影響を受けやすいため、体表だけでなく内臓負担と呼吸の状態も確認します。'},
    '感覚・その他': {type:'感覚過敏・環境ストレス反応型', tcm:'肝鬱・肝陽上亢・気滞傾向', body:'頭頸部、眼周囲、胸郭、背部', point:'音・光・気圧への過敏性は神経系の閾値低下として捉え、刺激量を抑えた調整を優先します。'}
  };

  const FOOD_RULES = [
    {name:'砂糖', doc:'砂糖資料', weight:0, keys:['イライラしやすい','気持ちの波が大きい','頭痛がする','肩こりがある','腰に違和感がある','便秘になりやすい','湿疹や肌荒れが出やすい','皮膚がかゆくなりやすい','寝てもスッキリしない'], reason:'血糖値の急上昇と急降下に伴うアドレナリン・ノルアドレナリン分泌、腸内環境の乱れが自律神経負担につながる可能性を説明します。', advice:'甘味を完全禁止にせず、白砂糖の頻度を見直し、きび砂糖・甜菜糖・黒砂糖などへ置き換える提案が向いています。'},
    {name:'小麦', doc:'小麦資料', weight:0, keys:['お腹が張りやすい','便秘と下痢を繰り返す','下痢をしやすい','便秘になりやすい','慢性的に疲れやすい','頭痛がする','肩こりがある','集中力が続かない','不安を感じやすい','湿疹や肌荒れが出やすい'], reason:'グルテンによる腸粘膜負担、腸管バリア低下、免疫・自律神経への影響を説明します。', advice:'連日のパン・麺・揚げ物を避け、米・玄米・雑穀・米粉食品への置き換えを提案しやすい状態です。'},
    {name:'乳製品', doc:'乳製品資料', weight:0, keys:['お腹が張りやすい','下痢をしやすい','胃の不快感がある','体が重だるい','慢性的に疲れやすい','頭痛がする','肩こりがある','気分が落ち込みやすい','湿疹や肌荒れが出やすい'], reason:'乳糖（ラクトース）分解負担、カゼインによる腸粘膜負担、軽い炎症反応や自律神経の乱れとの関連を説明します。', advice:'牛乳・ヨーグルト・チーズの頻度と摂取後の体調を確認し、豆乳、アーモンドミルク、小魚、海藻、味噌・ぬか漬けなどを候補にします。'}
  ];

  function gSelected(){ return new Set(Array.from(state.selected || [])); }
  function gCounts(){ return getCategoryBreakdown(gSelected()).filter(v=>v.selected>0).sort((a,b)=>b.selected-a.selected || b.ratio-a.ratio); }
  function gHasAny(keys, selected){ return keys.some(k => selected.has(k)); }
  function gScore(keys, selected){ return keys.reduce((n,k)=> n + (selected.has(k)?1:0), 0); }
  function gEsc(v){ return String(v==null?'':v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
  function gUrl(path){ return GENE_HP_BASE + path; }

  function geneHpMatches(selected){
    return HP_SYMPTOMS.map(s => ({...s, score:gScore(s.keys, selected)})).filter(s=>s.score>0).sort((a,b)=>b.score-a.score).slice(0,6);
  }

  function geneTypeReport(){
    const b = Object.fromEntries(gCounts().map(v=>[v.name,v.selected]));
    const selected = gSelected();
    const types = [];
    const add=(label,score,desc,tcm)=>{ if(score>0) types.push({label,score,desc,tcm}); };
    add('交感神経優位型', (b['睡眠']||0)+(b['精神・感情']||0)+(b['頭・神経系']||0)+(b['心臓・血圧・循環']||0), '睡眠・情動・循環の切り替えが不安定になり、過覚醒状態が続いている可能性があります。', '肝鬱気滞、心神不安、肝陽上亢');
    add('迷走神経・消化器負担型', (b['消化器']||0)*2+(b['全身・体調']||0)+(b['皮膚・発汗']||0), '胃腸症状と疲労・皮膚反応が重なる場合、腸管神経叢と迷走神経の負担を考えます。', '脾胃虚弱、肝脾不和、湿滞');
    add('呼吸・循環制限型', (b['呼吸']||0)*2+(b['心臓・血圧・循環']||0)+(b['筋肉・関節']||0), '胸郭の可動性低下、補助呼吸筋の緊張、循環調節の乱れを確認します。', '肺気虚、気滞、心気虚');
    add('感覚過敏・前庭神経型', (b['頭・神経系']||0)+(b['目・口・喉']||0)+(b['感覚・その他']||0), '光・音・気圧・めまい・耳鳴りなどが重なる場合、神経系の刺激閾値低下を見ます。', '肝陽上亢、腎虚、痰気交阻');
    add('皮膚・免疫バリア型', (b['皮膚・発汗']||0)*2+(b['消化器']||0), '皮膚バリア、腸内環境、免疫反応、自律神経の連動を確認します。', '肺脾気虚、血虚風燥、湿熱');
    add('骨盤内リズム型', (b['排尿・生理']||0)*2+(b['全身・体調']||0), '骨盤内循環、内分泌リズム、下腹部・仙骨周囲の緊張を確認します。', '腎虚、肝鬱、瘀血');
    types.sort((a,b)=>b.score-a.score);
    if(!types.length) return [{label:'未分類',score:0,desc:'選択項目が少ないため、明確なタイプ判定は行いません。',tcm:'-'}];
    return types.slice(0,3);
  }

  function lifestyleAdvice(){
    const selected = gSelected();
    const advice = [];
    const add=(title,items)=> advice.push({title,items});
    if(gHasAny(['寝つきが悪い','夜中に目が覚める','眠りが浅い','寝てもスッキリしない','朝早く目が覚めてしまう'], selected)) add('睡眠リズム', ['起床後に朝日を浴びる','就寝90分前までに入浴を済ませる','寝る直前のスマホ・強い光を控える','夕方以降のカフェインを見直す']);
    if(gHasAny(['胃もたれしやすい','胃の不快感がある','吐き気を感じることがある','お腹が張りやすい','便秘になりやすい','下痢をしやすい','便秘と下痢を繰り返す'], selected)) add('胃腸・食事', ['早食いを避け、よく噛む','夕食を遅くしすぎない','冷たい飲食物を続けない','食後すぐに横にならない']);
    if(gHasAny(['息が吸いにくい','深呼吸がしづらい','息苦しさを感じることがある','動悸がする','胸が苦しくなることがある'], selected)) add('呼吸・動悸', ['吸うより吐く時間を少し長くする','胸を張りすぎず肋骨の動きを作る','カフェイン・エナジードリンクの量を確認する','息苦しさが強い日は無理な運動を避ける']);
    if(gHasAny(['手足や体が冷えやすい','寒暖差に弱い','のぼせやすい'], selected)) add('冷え・循環', ['足首・下腹部を冷やさない','短時間でもふくらはぎを動かす','白湯など温かい飲み物を取り入れる','長時間同じ姿勢を避ける']);
    if(gHasAny(['皮膚がかゆくなりやすい','湿疹や肌荒れが出やすい','肌が乾燥しやすい','浸出液が出る'], selected)) add('皮膚・腸内環境', ['睡眠不足を避ける','汗をかいた後は刺激を残さない','砂糖・小麦・乳製品の摂取後の変化を記録する','便通と皮膚状態を一緒に確認する']);
    if(!advice.length) add('基本ケア', ['睡眠・食事・呼吸・歩行量を一つずつ確認する','症状が増えるタイミングをメモする','無理な制限ではなく継続できる調整を優先する']);
    return advice.slice(0,5);
  }

  function foodAdvice(){
    const selected = gSelected();
    return FOOD_RULES.map(rule => ({...rule, score:gScore(rule.keys, selected)})).filter(v=>v.score>0).sort((a,b)=>b.score-a.score).slice(0,3);
  }

  function treatmentPlan(){
    const counts = gCounts();
    const blocks = counts.slice(0,4).map(c => {
      const d = CATEGORY_MEDICAL[c.name] || {type:'全身調整型',tcm:'気血水の偏り',body:'全身',point:'選択項目に応じて身体全体の反応を確認します。'};
      return {cat:c.name, count:c.selected, ...d};
    });
    if(!blocks.length) return [{cat:'未選択',count:0,type:'-',tcm:'-',body:'-',point:'症状を選択すると施術方針が表示されます。'}];
    return blocks;
  }

  function practitionerChecks(){
    const selected = gSelected();
    const list = [];
    if(gHasAny(['寝つきが悪い','夜中に目が覚める','眠りが浅い'], selected)) list.push('睡眠時間、中途覚醒、起床時疲労、就寝前スマホ・カフェイン');
    if(gHasAny(['胃の不快感がある','便秘になりやすい','下痢をしやすい','お腹が張りやすい'], selected)) list.push('便通頻度、腹部膨満、食後症状、砂糖・小麦・乳製品摂取頻度');
    if(gHasAny(['動悸がする','息苦しさを感じることがある','血圧が不安定だと感じる'], selected)) list.push('安静時拍動感、カフェイン量、呼吸の浅さ、胸郭可動性');
    if(gHasAny(['めまいがする','立ちくらみがある','耳鳴りがする'], selected)) list.push('起立時変化、首肩緊張、眼精疲労、気圧変化の影響');
    if(gHasAny(['湿疹や肌荒れが出やすい','皮膚がかゆくなりやすい'], selected)) list.push('皮膚悪化の時期、睡眠、便通、発汗、食品摂取後の変化');
    if(!list.length) list.push('症状の出る時間帯、悪化要因、睡眠、食事、ストレス、姿勢負担');
    return list;
  }

  function totalScore(){
    const total = state.selected.size;
    const cats = gCounts().length;
    const intense = gCounts().slice(0,3).reduce((s,v)=>s+v.selected,0);
    const score = Math.min(100, Math.round(total*1.05 + cats*3 + intense*1.2));
    let label = '軽度';
    if(score >= 66) label = '重度';
    else if(score >= 36) label = '中度';
    return {score,label};
  }

  function ensureGeneAdvancedSections(){
    const result = document.getElementById('resultSection');
    if(result && !document.getElementById('geneAdvancedReport')){
      const section = document.createElement('div');
      section.id = 'geneAdvancedReport';
      section.className = 'gene-advanced-report';
      section.innerHTML = `
        <div class="advanced-card"><div class="section-head mini"><h3>医学的・東洋医学的レポート</h3><p>HP症状ページ / 生活資料連動</p></div><div id="geneTypeCards" class="advanced-grid"></div></div>
        <div class="advanced-card"><h3>HP症状ページとの関連</h3><div id="geneHpLinks" class="hp-link-grid"></div></div>
        <div class="advanced-card"><h3>施術方針の見立て</h3><div id="geneTreatmentPlan" class="treatment-list"></div></div>
        <div class="advanced-card"><h3>生活習慣アドバイス</h3><div id="geneLifestyleAdvice" class="lifestyle-list"></div></div>
        <div class="advanced-card"><h3>砂糖・小麦・乳製品との関連</h3><div id="geneFoodAdvice" class="food-list"></div></div>
        <div class="advanced-card"><h3>施術者用確認ポイント</h3><ul id="genePractitionerChecks" class="check-list"></ul></div>
        <p class="gene-disclaimer">※この結果は医療上の診断ではありません。強い症状、急な悪化、胸痛、強い息苦しさ、神経症状がある場合は医療機関への相談を優先してください。</p>
      `;
      const anchor = result.querySelector('.history-card') || result.querySelector('.selected-card') || result.lastElementChild;
      result.insertBefore(section, anchor);
    }
    const printInner = document.querySelector('#printOnlyReport .print-report-inner');
    if(printInner && !document.getElementById('printGeneAdvanced')){
      const p = document.createElement('section');
      p.id = 'printGeneAdvanced';
      p.className = 'print-section';
      p.innerHTML = `
        <h2>医学的・東洋医学的見立て</h2><div id="printGeneTypes"></div>
        <h2>施術方針</h2><div id="printGeneTreatment"></div>
        <h2>生活習慣アドバイス</h2><div id="printGeneLifestyle"></div>
        <h2>砂糖・小麦・乳製品との関連</h2><div id="printGeneFood"></div>
        <h2>施術者用確認ポイント</h2><div id="printGeneChecks"></div>
      `;
      const footer = printInner.querySelector('.print-footer');
      printInner.insertBefore(p, footer || null);
    }
  }

  function renderAdvancedGeneReport(){
    ensureGeneAdvancedSections();
    const selected = gSelected();
    const score = totalScore();
    const types = geneTypeReport();
    const hp = geneHpMatches(selected);
    const plan = treatmentPlan();
    const lifestyle = lifestyleAdvice();
    const foods = foodAdvice();
    const checks = practitionerChecks();

    const typeEl = document.getElementById('geneTypeCards');
    if(typeEl) typeEl.innerHTML = `
      <div class="advanced-score"><small>総合スコア</small><strong>${score.score}</strong><span>${score.label}</span></div>
      ${types.map(t=>`<div class="advanced-type"><h4>${gEsc(t.label)}</h4><p>${gEsc(t.desc)}</p><p><strong>東洋医学的傾向：</strong>${gEsc(t.tcm)}</p></div>`).join('')}`;

    const hpEl = document.getElementById('geneHpLinks');
    if(hpEl) hpEl.innerHTML = hp.length ? hp.map(h=>`<a class="hp-link" href="${gUrl(h.url)}" target="_blank" rel="noopener"><strong>${gEsc(h.name)}</strong><span>関連 ${h.score}項目 / 詳細ページへ</span></a>`).join('') : '<p>関連するHP症状ページは、選択後に表示されます。</p>';

    const trEl = document.getElementById('geneTreatmentPlan');
    if(trEl) trEl.innerHTML = plan.map(p=>`<div class="treatment-item"><h4>${gEsc(p.cat)}：${gEsc(p.type)}</h4><p><strong>確認部位：</strong>${gEsc(p.body)}</p><p><strong>東洋医学的見立て：</strong>${gEsc(p.tcm)}</p><p>${gEsc(p.point)}</p></div>`).join('');

    const lifeEl = document.getElementById('geneLifestyleAdvice');
    if(lifeEl) lifeEl.innerHTML = lifestyle.map(a=>`<div class="lifestyle-item"><h4>${gEsc(a.title)}</h4><ul>${a.items.map(i=>`<li>${gEsc(i)}</li>`).join('')}</ul></div>`).join('');

    const foodEl = document.getElementById('geneFoodAdvice');
    if(foodEl) foodEl.innerHTML = foods.length ? foods.map(f=>`<div class="food-item"><h4>${gEsc(f.name)}との関連</h4><p>${gEsc(f.reason)}</p><p><strong>提案：</strong>${gEsc(f.advice)}</p><span>${gEsc(f.doc)}と関連付け</span></div>`).join('') : '<p>砂糖・小麦・乳製品との強い関連は現時点では目立ちません。症状の出方に応じて確認します。</p>';

    const chkEl = document.getElementById('genePractitionerChecks');
    if(chkEl) chkEl.innerHTML = checks.map(c=>`<li>${gEsc(c)}</li>`).join('');
  }

  function renderAdvancedPrintReport(){
    ensureGeneAdvancedSections();
    const selected = gSelected();
    const score = totalScore();
    const types = geneTypeReport();
    const plan = treatmentPlan();
    const lifestyle = lifestyleAdvice();
    const foods = foodAdvice();
    const checks = practitionerChecks();
    const set=(id,html)=>{ const el=document.getElementById(id); if(el) el.innerHTML=html; };
    set('printGeneTypes', `<p><strong>総合スコア：</strong>${score.score}（${score.label}）</p>` + types.map(t=>`<p><strong>${gEsc(t.label)}</strong><br>${gEsc(t.desc)}<br>東洋医学的傾向：${gEsc(t.tcm)}</p>`).join(''));
    set('printGeneTreatment', plan.map(p=>`<p><strong>${gEsc(p.cat)}：${gEsc(p.type)}</strong><br>確認部位：${gEsc(p.body)}<br>東洋医学的見立て：${gEsc(p.tcm)}<br>${gEsc(p.point)}</p>`).join(''));
    set('printGeneLifestyle', lifestyle.map(a=>`<p><strong>${gEsc(a.title)}</strong><br>${a.items.map(i=>'・'+gEsc(i)).join('<br>')}</p>`).join(''));
    set('printGeneFood', foods.length ? foods.map(f=>`<p><strong>${gEsc(f.name)}</strong><br>${gEsc(f.reason)}<br>提案：${gEsc(f.advice)}</p>`).join('') : '<p>強い関連は目立ちません。</p>');
    set('printGeneChecks', '<ul>' + checks.map(c=>`<li>${gEsc(c)}</li>`).join('') + '</ul>');
  }

  const baseRenderResult = renderResult;
  renderResult = function(){ baseRenderResult(); renderAdvancedGeneReport(); };
  const baseRenderPrintReport = renderPrintReport;
  renderPrintReport = function(){ baseRenderPrintReport(); renderAdvancedPrintReport(); };
})();



/* =========================================================
   GENE A4 WHITE PRINT REPORT BUILDER
========================================================= */
(function(){
  const symptomMeta = {
    "めまい": {cat:"頭・神経系", hp:"めまい", medical:"前庭系・頸部固有受容器・自律神経性血流調節の影響を考慮します。", tcm:"肝陽上亢・痰濁・気血不足の観点で評価します。"},
    "耳鳴り": {cat:"頭・神経系", hp:"耳鳴り", medical:"内耳循環、頸部筋緊張、睡眠・ストレス負荷との関連を確認します。", tcm:"腎虚・肝火・気滞の観点で評価します。"},
    "パニック障害": {cat:"精神・感情", hp:"パニック症状", medical:"過換気傾向、交感神経興奮、扁桃体過活動に伴う身体反応を考慮します。", tcm:"気逆・気滞・心脾両虚の観点で評価します。"},
    "不眠症": {cat:"睡眠・精神", hp:"不眠", medical:"睡眠覚醒リズム、HPA軸、コルチゾール分泌、交感神経優位を確認します。", tcm:"心血虚・陰虚火旺・肝鬱化火の観点で評価します。"},
    "慢性疲労": {cat:"全身・体調", hp:"慢性疲労", medical:"慢性炎症、睡眠の質、ミトコンドリア疲労、血糖変動の影響を確認します。", tcm:"脾気虚・腎虚・気血両虚の観点で評価します。"},
    "PMS": {cat:"婦人科・ホルモン", hp:"PMS", medical:"黄体期の自律神経変動、ホルモン変動、炎症反応を考慮します。", tcm:"肝鬱気滞・瘀血・脾虚の観点で評価します。"},
    "冷え性": {cat:"循環器系", hp:"冷え性", medical:"末梢循環、筋ポンプ低下、交感神経性血管収縮を確認します。", tcm:"陽虚・血虚・瘀血の観点で評価します。"},
    "アトピー性皮膚炎": {cat:"皮膚・免疫", hp:"アトピー", medical:"皮膚バリア、腸内環境、免疫過敏、慢性炎症を確認します。", tcm:"血熱・湿熱・脾虚湿盛の観点で評価します。"},
    "過敏性腸症候群": {cat:"消化器", hp:"過敏性腸症候群", medical:"腸脳相関、内臓知覚過敏、腸管運動、自律神経バランスを確認します。", tcm:"肝脾不和・脾虚・気滞の観点で評価します。"},
    "慢性便秘": {cat:"消化器", hp:"慢性便秘", medical:"腸管蠕動、骨盤底機能、水分摂取、交感神経緊張を確認します。", tcm:"気虚・血虚・腸燥・気滞の観点で評価します。"},
    "起立性調節障害": {cat:"循環器系", hp:"起立性調節障害", medical:"血圧調節、静脈還流、交感神経反応、睡眠リズムを確認します。", tcm:"気血不足・腎虚・陽虚の観点で評価します。"},
    "機能性ディスペプシア": {cat:"消化器", hp:"機能性ディスペプシア", medical:"胃運動、内臓知覚過敏、迷走神経機能、ストレス負荷を確認します。", tcm:"脾胃虚弱・肝胃不和・痰湿の観点で評価します。"},
    "頭痛": {cat:"頭・神経系", hp:"頭痛", medical:"頸部筋緊張、血流調節、三叉神経血管系、睡眠負荷を確認します。", tcm:"肝陽上亢・瘀血・気血不足の観点で評価します。"},
    "肩こり": {cat:"筋骨格", hp:"肩こり", medical:"僧帽筋・肩甲挙筋・後頭下筋群の過緊張、呼吸補助筋の負担を確認します。", tcm:"気滞血瘀・寒凝・肝鬱の観点で評価します。"},
    "腰痛": {cat:"筋骨格", hp:"腰痛", medical:"腰背部筋膜、股関節可動性、腹圧、仙腸関節周囲の負担を確認します。", tcm:"腎虚・瘀血・寒湿の観点で評価します。"},
    "膝痛": {cat:"筋骨格", hp:"膝痛", medical:"股関節・足関節連動、膝蓋大腿関節、下肢アライメントを確認します。", tcm:"腎虚・寒湿・瘀血の観点で評価します。"},
    "足底筋膜炎": {cat:"筋骨格", hp:"足底筋膜炎", medical:"足底腱膜、下腿三頭筋、足部アーチ、荷重バランスを確認します。", tcm:"腎虚・瘀血・経絡停滞の観点で評価します。"},
    "顎関節症": {cat:"頭・神経系", hp:"顎関節症", medical:"咬筋・側頭筋・胸鎖乳突筋、頸椎姿勢、ストレス性食いしばりを確認します。", tcm:"肝鬱気滞・胃経の緊張の観点で評価します。"},
    "腱鞘炎": {cat:"筋骨格", hp:"腱鞘炎", medical:"前腕屈筋群・伸筋群、手関節アライメント、反復負荷を確認します。", tcm:"気血瘀滞・経絡阻滞の観点で評価します。"},
    "外反母趾": {cat:"筋骨格", hp:"外反母趾", medical:"足部アーチ、母趾MTP関節、下腿・股関節の連動を確認します。", tcm:"腎虚・経絡停滞・瘀血の観点で評価します。"},
    "息苦しさ": {cat:"呼吸・循環", hp:"息苦しさ", medical:"横隔膜、胸郭可動性、過換気傾向、交感神経緊張を確認します。", tcm:"気滞・気逆・肺気虚の観点で評価します。"},
    "動悸": {cat:"呼吸・循環", hp:"動悸", medical:"交感神経興奮、血糖変動、睡眠不足、カフェイン影響を確認します。", tcm:"心血虚・気陰両虚・痰火擾心の観点で評価します。"},
    "喉の違和感": {cat:"呼吸・循環", hp:"喉の違和感", medical:"咽喉頭緊張、頸部筋緊張、逆流・ストレス反応を確認します。", tcm:"梅核気・肝鬱気滞・痰気互結の観点で評価します。"}
  };

  function cleanText(s){
    return (s || "").replace(/\s+/g, " ").trim();
  }

  function getCheckedSymptoms(){
    const checked = Array.from(document.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked'));
    const texts = [];
    checked.forEach(el => {
      let labelText = "";
      const id = el.getAttribute("id");
      if(id){
        const label = document.querySelector('label[for="'+CSS.escape(id)+'"]');
        if(label) labelText = cleanText(label.innerText);
      }
      if(!labelText){
        const label = el.closest("label");
        if(label) labelText = cleanText(label.innerText);
      }
      if(!labelText && el.value) labelText = cleanText(el.value);
      Object.keys(symptomMeta).forEach(key => {
        if(labelText.includes(key) && !texts.includes(key)) texts.push(key);
      });
    });

    if(texts.length) return texts;

    const bodyText = document.body.innerText || "";
    return Object.keys(symptomMeta).filter(key => bodyText.includes(key) && /選択|チェック|項目|点|傾向|分析/.test(bodyText));
  }

  function getPatientMeta(){
    function normalize(s){
      return (s || "").replace(/\s+/g, " ").trim();
    }

    function findInputByKeywords(keywords){
      const fields = Array.from(document.querySelectorAll("input, textarea, select"));
      for(const el of fields){
        const id = el.id || "";
        const name = el.name || "";
        const placeholder = el.placeholder || "";
        const aria = el.getAttribute("aria-label") || "";
        let labelText = "";

        if(id){
          try{
            const label = document.querySelector('label[for="'+CSS.escape(id)+'"]');
            if(label) labelText += " " + label.innerText;
          }catch(e){}
        }

        const parent = el.closest("label, tr, .field, .form-group, .input-row, .question, .card, section, div");
        if(parent) labelText += " " + parent.innerText;

        const haystack = normalize([id,name,placeholder,aria,labelText].join(" "));
        if(keywords.some(k => haystack.includes(k))){
          const value = normalize(el.value);
          if(value) return value;
        }
      }
      return "";
    }

    const name =
      findInputByKeywords(["お名前","名前","氏名","name","patient"]) ||
      findInputByKeywords(["フリガナ","ふりがな","kana"]);

    const age = findInputByKeywords(["年齢","年令","age","歳"]);

    const now = new Date();
    const date = now.getFullYear()+"/"+String(now.getMonth()+1).padStart(2,"0")+"/"+String(now.getDate()).padStart(2,"0")+" "+String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
    return {name: name || "未入力", age: age || "-", date};
  }

  function categoryCounts(symptoms){
    const counts = {};
    symptoms.forEach(s => {
      const cat = symptomMeta[s]?.cat || "その他";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }

  function scoreLevel(n){
    if(n >= 16) return {score: 82, label:"重度"};
    if(n >= 8) return {score: 58, label:"中度"};
    if(n >= 3) return {score: 34, label:"軽度"};
    return {score: 12, label:"低負担"};
  }

  function topSymptoms(symptoms){
    return symptoms.slice(0,5);
  }

  function tendencyText(symptoms, counts){
    const cats = Object.keys(counts).sort((a,b)=>counts[b]-counts[a]);
    if(!symptoms.length) return "現在選択されている症状項目はありません。";
    const main = cats.slice(0,3).join("・");
    return `${main}の比率が高く、自律神経系・内臓機能・筋膜緊張が相互に影響している可能性があります。症状を単独で見るのではなく、睡眠、消化、循環、呼吸、姿勢負荷を合わせて評価します。`;
  }

  function medicalLines(symptoms){
    const picked = symptoms.slice(0,6);
    if(!picked.length) return [{label:"医学的評価", text:"症状選択後に、神経系・消化器系・循環器系・筋骨格系の関連を表示します。"}];
    return picked.map(s => ({label:s, text:symptomMeta[s].medical}));
  }

  function tcmLines(symptoms){
    const has = k => symptoms.includes(k);
    const lines = [];
    if(has("喉の違和感") || has("息苦しさ") || has("動悸") || has("パニック障害")) lines.push({label:"気の巡り（気滞・気逆）", text:"胸郭・横隔膜・頸部の緊張を整え、呼吸に伴う気の昇降を回復しやすい状態へ導きます。"});
    if(has("慢性疲労") || has("慢性便秘") || has("機能性ディスペプシア") || has("過敏性腸症候群")) lines.push({label:"脾胃の弱り（脾虚・肝脾不和）", text:"腹部、横隔膜、背部の緊張を確認し、消化器への自律神経入力が安定しやすい状態を目指します。"});
    if(has("冷え性") || has("耳鳴り") || has("腰痛") || has("膝痛")) lines.push({label:"腎の弱り（腎虚）", text:"骨盤帯、腰背部、下肢の循環と支持性を整え、冷えや慢性疲労に関わる土台を評価します。"});
    if(has("頭痛") || has("肩こり") || has("めまい") || has("顎関節症")) lines.push({label:"肝の緊張（肝鬱・肝陽上亢）", text:"後頭下筋群、側頭部、頸肩部の過緊張をゆるめ、頭頸部の血流・神経刺激を落ち着かせます。"});
    if(has("アトピー性皮膚炎")) lines.push({label:"湿熱・血熱", text:"皮膚症状は腸内環境、睡眠、ストレス、炎症負荷と合わせて確認します。"});
    if(!lines.length) lines.push({label:"全身調整", text:"呼吸・姿勢・循環・消化の反応を確認し、気血水の偏りを総合的に見立てます。"});
    return lines.slice(0,5);
  }

  function lifestyleLines(symptoms){
    const lines = [];
    if(symptoms.some(s => ["不眠症","パニック障害","動悸","息苦しさ"].includes(s))) lines.push({label:"睡眠・呼吸", text:"就寝90分前の入浴、寝る直前のスマホ・PCを控える、吐く息を長くする呼吸を取り入れます。"});
    if(symptoms.some(s => ["過敏性腸症候群","慢性便秘","機能性ディスペプシア","アトピー性皮膚炎"].includes(s))) lines.push({label:"食事・消化", text:"よく噛む、夕食を遅くしない、発酵食品・食物繊維・水分摂取を意識します。"});
    if(symptoms.some(s => ["冷え性","起立性調節障害","めまい","慢性疲労"].includes(s))) lines.push({label:"循環・体温", text:"朝日を浴びる、足首を冷やさない、軽い歩行で下肢の筋ポンプを使います。"});
    if(symptoms.some(s => ["肩こり","腰痛","膝痛","足底筋膜炎","顎関節症","腱鞘炎","外反母趾"].includes(s))) lines.push({label:"姿勢・運動", text:"同じ姿勢を長時間続けず、胸郭・股関節・足首の可動性を保つ軽い運動を行います。"});
    if(!lines.length) lines.push({label:"生活リズム", text:"睡眠、食事、運動、呼吸の基本リズムを整えることを優先します。"});
    return lines;
  }

  function foodLines(symptoms){
    const sugarRel = symptoms.some(s => ["動悸","パニック障害","不眠症","慢性疲労","肩こり","頭痛","慢性便秘","アトピー性皮膚炎"].includes(s));
    const wheatRel = symptoms.some(s => ["過敏性腸症候群","機能性ディスペプシア","慢性便秘","アトピー性皮膚炎","慢性疲労","頭痛","肩こり"].includes(s));
    const dairyRel = symptoms.some(s => ["過敏性腸症候群","機能性ディスペプシア","慢性便秘","アトピー性皮膚炎","慢性疲労","頭痛","肩こり"].includes(s));

    return [
      {label:"砂糖", text: sugarRel ? "血糖値の急上昇・急降下に伴うアドレナリン分泌、交感神経興奮、腸内環境の乱れを確認します。甘味は完全禁止ではなく、頻度を見直し、きび砂糖・甜菜糖・黒砂糖などへの置き換えを候補にします。" : "強い関連は目立ちませんが、血糖変動と睡眠・気分・疲労感の関係は確認します。"},
      {label:"小麦", text: wheatRel ? "グルテンによる腸粘膜負担、腸管バリア低下、免疫・自律神経への影響を確認します。連日のパン・麺・揚げ物を避け、米・玄米・雑穀・米粉食品への置き換えを候補にします。" : "強い関連は目立ちませんが、連日摂取や体調不良時の摂取量を確認します。"},
      {label:"乳製品", text: dairyRel ? "乳糖分解負担、カゼインによる腸粘膜負担、軽い炎症反応の可能性を確認します。牛乳・ヨーグルト・チーズの頻度と摂取後の体調を確認し、豆乳・アーモンドミルク・小魚・海藻・味噌などを候補にします。" : "強い関連は目立ちませんが、摂取後のお腹の張り、下痢、だるさ、皮膚症状の変化を確認します。"}
    ];
  }

  function drawPrintChart(canvas, counts, total){
    if(!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const dpr = 2;
    const size = 260;
    canvas.width = size*dpr;
    canvas.height = size*dpr;
    ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,size,size);

    const entries = Object.entries(counts);
    if(!entries.length){
      ctx.beginPath();
      ctx.arc(size/2,size/2,95,0,Math.PI*2);
      ctx.strokeStyle="#999";
      ctx.lineWidth=28;
      ctx.stroke();
      return;
    }
    const shades = ["#333","#666","#888","#aaa","#c8c8c8","#dedede","#b5b5b5","#777"];
    let start = -Math.PI/2;
    entries.forEach(([cat,n],i)=>{
      const angle = (n/total)*Math.PI*2;
      ctx.beginPath();
      ctx.arc(size/2,size/2,78,start,start+angle);
      ctx.strokeStyle = shades[i % shades.length];
      ctx.lineWidth = 24;
      ctx.stroke();
      start += angle;
    });
    ctx.beginPath();
    ctx.arc(size/2,size/2,45,0,Math.PI*2);
    ctx.fillStyle="#fff";
    ctx.fill();
    ctx.fillStyle="#111";
    ctx.textAlign="center";
    ctx.font="bold 24px sans-serif";
    ctx.fillText(String(total), size/2, size/2+3);
    ctx.font="10px sans-serif";
    ctx.fillText("項目", size/2, size/2+20);
  }

  function buildBars(counts,total){
    const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    return entries.map(([cat,n])=>{
      const pct = total ? Math.round(n/total*100) : 0;
      return `<div class="gene-print-bar-row"><span>${cat}</span><div class="gene-print-bar-track"><div class="gene-print-bar-fill" style="width:${pct}%"></div></div><span>${pct}%</span></div>`;
    }).join("");
  }

  function buildReport(){
    const target = document.getElementById("geneA4PrintReport");
    if(!target) return;

    const symptoms = getCheckedSymptoms();
    const counts = categoryCounts(symptoms);
    const total = symptoms.length;
    const lv = scoreLevel(total);
    const meta = getPatientMeta();
    const top = topSymptoms(symptoms);
    const cats = Object.keys(counts).sort((a,b)=>counts[b]-counts[a]);
    const med = medicalLines(symptoms);
    const tcm = tcmLines(symptoms);
    const life = lifestyleLines(symptoms);
    const food = foodLines(symptoms);

    target.innerHTML = `
      <div class="gene-print-header">
        <div>
          <h1 class="gene-print-title">総合分析レポート</h1>
          <div class="gene-print-subtitle">大阪 自律神経専門整体院 gene｜問診チェック結果</div>
        </div>
        <div class="gene-print-meta">
          診断日：${meta.date}<br>
          お名前：${meta.name} 様<br></div>
      </div>

      <div class="gene-print-grid-top">
        <section class="gene-print-card">
          <h2>① 集計結果</h2>
          <div class="gene-print-chart-row">
            <div>
              <div class="gene-print-score"><strong>${lv.score}</strong><span>/100点</span></div>
              <span class="gene-print-badge">${lv.label}</span>
              <p class="gene-print-small">合計チェック数：${total}項目</p>
            </div>
            <div class="gene-print-chart-wrap"><canvas id="genePrintDonutChart"></canvas></div>
          </div>
          <div class="gene-print-bars">${buildBars(counts,total)}</div>
        </section>

        <section class="gene-print-card">
          <h2>② 詳細分析</h2>
          ${top.length ? top.map((s,i)=>`<div class="gene-print-rank"><span>${i+1}位</span><span>${s}</span><span>${symptomMeta[s]?.cat || ""}</span></div>`).join("") : `<p>選択項目はありません。</p>`}
          <h3>選択された項目</h3>
          <p class="gene-print-small">${symptoms.length ? symptoms.join("、") : "なし"}</p>
        </section>
      </div>

      <div class="gene-print-grid-2">
        <section class="gene-print-card is-soft">
          <h2>③ 今回の傾向</h2>
          <p>${tendencyText(symptoms, counts)}</p>
          <p class="gene-print-small">重点カテゴリ：${cats.length ? cats.slice(0,3).join("、") : "なし"}</p>
        </section>

        <section class="gene-print-card is-soft">
          <h2>④ 医学的レポート</h2>
          ${med.map(x=>`<div class="gene-print-report-line"><div class="gene-print-report-label">${x.label}</div><div>${x.text}</div></div>`).join("")}
        </section>
      </div>

      <div class="gene-print-grid-2">
        <section class="gene-print-card">
          <h2>⑤ 東洋医学的レポート</h2>
          ${tcm.map(x=>`<div class="gene-print-report-line"><div class="gene-print-report-label">${x.label}</div><div>${x.text}</div></div>`).join("")}
        </section>

        <section class="gene-print-card">
          <h2>⑥ 生活習慣アドバイス</h2>
          ${life.map(x=>`<div class="gene-print-report-line"><div class="gene-print-report-label">${x.label}</div><div>${x.text}</div></div>`).join("")}
        </section>
      </div>

      <section class="gene-print-card">
        <h2>⑦ 砂糖・小麦・乳製品との関連</h2>
        ${food.map(x=>`<div class="gene-print-food"><div class="gene-print-food-title">${x.label}</div><div>${x.text}</div></div>`).join("")}
      </section>

      <div class="gene-print-note">
        ※本レポートは医療上の診断・治療を行うものではありません。強い症状や急な不調がある場合は医療機関へご相談ください。施術では、身体の中（内臓・自律神経）と外（筋肉・骨格・筋膜）の両面から状態を確認します。
      </div>
      <div class="gene-print-footer">大阪 自律神経専門整体院 gene</div>
    `;

    setTimeout(()=>drawPrintChart(document.getElementById("genePrintDonutChart"), counts, Math.max(total,1)), 30);
  }

  window.geneBuildA4PrintReport = buildReport;
  window.addEventListener("beforeprint", buildReport);
  if (window.matchMedia) {
    const media = window.matchMedia("print");
    if(media && media.addEventListener){
      media.addEventListener("change", e => { if(e.matches) buildReport(); });
    }
  }
  document.addEventListener("DOMContentLoaded", buildReport);
})();
