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
  hpSymptomLinks: $('hpSymptomLinks'),
  medicalInterpretation: $('medicalInterpretation'),
  tcmPatternText: $('tcmPatternText'),
  treatmentViewText: $('treatmentViewText'),
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


const symptomKnowledgeBase = [
  {
    title:'めまい',
    url:'https://gene-seitai.com/dizziness.html',
    keywords:['めまいがする','立ちくらみがある','ふらつく感じがある','耳鳴りがする','頭がぼーっとする','息苦しさを感じることがある','動悸がする'],
    medical:'前庭—自律神経連関、頸性要素、起立時循環調節、過換気傾向、交感神経過活動の関与を確認します。',
    tcm:'肝陽上亢、痰湿中阻、気血不足、腎精不足を鑑別し、のぼせ型・疲労型・胃腸虚弱型に分けて見ます。',
    treatment:'後頭下筋群、上部頸椎、胸郭入口部、横隔膜、足部接地を確認し、督脈・膀胱経・肝経・腎経の反応を見ながら刺激量を抑えて整えます。'
  },
  {
    title:'不眠',
    url:'https://gene-seitai.com/insomnia.html',
    keywords:['寝つきが悪い','夜中に目が覚める','朝早く目が覚めてしまう','眠りが浅い','夢をよく見る','寝てもスッキリしない','理由のない緊張感がある'],
    medical:'過覚醒、睡眠覚醒リズムの乱れ、交感神経優位、呼吸の浅さ、頸胸部筋緊張による休息反応の低下を確認します。',
    tcm:'心脾両虚、肝鬱化火、陰虚火旺、痰熱内擾を中心に、眠りの浅さ・中途覚醒・夢の多さの出方で整理します。',
    treatment:'後頭部、頸胸移行部、胸椎、肋骨、横隔膜、腹部の緊張をゆるめ、任脈・心包経・脾経・腎経を意識して休息へ移行しやすい状態を作ります。'
  },
  {
    title:'頭痛',
    url:'https://gene-seitai.com/headache.html',
    keywords:['頭痛がする','頭が締め付けられる感じがする','首こりがある','肩こりがある','目が疲れやすい','光がまぶしく感じる','天候や気圧の変化で体調が変わる'],
    medical:'頸性頭痛、筋緊張性頭痛様の要素、眼精疲労、三叉神経—頸部連関、呼吸性筋緊張、自律神経性血管反応を確認します。',
    tcm:'肝鬱気滞、肝陽上亢、瘀血、気血不足、痰湿を見立て、側頭部・後頭部・締め付け感など部位と性質で整理します。',
    treatment:'後頭下筋群、側頭筋、咬筋、胸鎖乳突筋、肩甲帯、胸郭を確認し、胆経・膀胱経・督脈・肝経の緊張連鎖を整えます。'
  },
  {
    title:'動悸',
    url:'https://gene-seitai.com/palpitation.html',
    keywords:['動悸がする','脈が乱れる感じがある','胸が苦しくなることがある','息切れしやすい','血圧が不安定だと感じる','不安を感じやすい'],
    medical:'心拍知覚過敏、交感神経活動亢進、呼吸パターン異常、胸郭可動性低下、圧受容器反射の不安定さを確認します。',
    tcm:'心気虚、心血虚、心脾両虚、肝鬱気滞、痰飲を鑑別し、不安感・息切れ・疲労の有無で整理します。',
    treatment:'胸郭、胸骨周囲、肋間、横隔膜、背部上位胸椎を確認し、心包経・任脈・膀胱経を中心に呼吸と循環の負担を下げる方向で整えます。'
  },
  {
    title:'パニック症状・不安障害',
    url:'https://gene-seitai.com/anxiety-disorder.html',
    keywords:['不安を感じやすい','理由のない緊張感がある','人前で緊張しやすい','外出が不安になることがある','息が吸いにくい','深呼吸がしづらい','胸が苦しくなることがある'],
    medical:'予期不安、過換気傾向、身体感覚への過敏化、交感神経優位、扁桃体—自律神経系の過反応を確認します。',
    tcm:'肝気鬱結、心神不寧、痰気交阻、心脾両虚を中心に、胸の詰まり・喉の違和感・不安感の連動で見ます。',
    treatment:'胸郭、横隔膜、喉周囲、後頭部、みぞおちの緊張を確認し、任脈・心包経・肝経・脾経を意識して過緊張を鎮める刺激量で調整します。'
  },
  {
    title:'起立性調節障害',
    url:'https://gene-seitai.com/orthostatic-dysregulation.html',
    keywords:['朝起きるのがつらい','立ちくらみがある','ふらつく感じがある','休んでも疲れが取れない','体が重だるい','血圧が不安定だと感じる','寒暖差に弱い'],
    medical:'起立時循環調節、圧受容器反射、自律神経切り替え、下肢静脈還流、頸胸部緊張、呼吸浅化の影響を確認します。',
    tcm:'気虚、陽虚、腎虚、脾虚、痰湿を中心に、朝の弱さ・冷え・倦怠感・ふらつきの組み合わせで整理します。',
    treatment:'下腿、足部、骨盤、腹部、横隔膜、頸胸移行部を確認し、腎経・脾経・胃経・督脈を意識して循環と姿勢保持の土台を整えます。'
  },
  {
    title:'過敏性腸症候群',
    url:'https://gene-seitai.com/ibs.html',
    keywords:['お腹が張りやすい','便秘になりやすい','下痢をしやすい','便秘と下痢を繰り返す','緊張するとお腹の症状が出やすい','食欲がない'],
    medical:'脳腸相関、内臓知覚過敏、腸管運動の不安定性、ストレス反応、横隔膜と腹圧調整を確認します。',
    tcm:'肝脾不和、脾虚、湿困脾胃、気滞、寒熱錯雑を見立て、便秘型・下痢型・交替型に分けて整理します。',
    treatment:'腹部、みぞおち、背部胸腰移行部、骨盤、横隔膜を確認し、脾経・胃経・肝経・任脈を中心に腹部内圧と呼吸の連動を整えます。'
  },
  {
    title:'慢性便秘',
    url:'https://gene-seitai.com/chronic-constipation.html',
    keywords:['便秘になりやすい','お腹が張りやすい','食欲がない','胃もたれしやすい','体が重だるい','運動不足を感じる'],
    medical:'腸管運動低下、腹圧低下、骨盤底・横隔膜の協調性、交感神経優位による消化管活動低下を確認します。',
    tcm:'気虚便秘、気滞便秘、血虚便秘、冷えによる陽虚便秘を鑑別し、腹部の張り・冷え・疲労の有無で整理します。',
    treatment:'下腹部、骨盤、腰背部、横隔膜、股関節を確認し、大腸経・胃経・脾経・任脈の流れを意識して排出リズムを整えます。'
  },
  {
    title:'胃の不快感・機能性ディスペプシア',
    url:'https://gene-seitai.com/stomach-discomfort.html',
    keywords:['胃もたれしやすい','胃の不快感がある','吐き気を感じることがある','食欲がない','食後に苦しくなる','みぞおちが重い'],
    medical:'胃運動低下、内臓知覚過敏、脳腸相関、迷走神経機能、背部緊張、ストレス反応を確認します。',
    tcm:'脾胃虚弱、肝胃不和、気滞、痰湿、胃寒を中心に、食後症状・みぞおちの重さ・吐き気で整理します。',
    treatment:'みぞおち、腹部、背部中下部、横隔膜、肋骨下縁を確認し、胃経・脾経・肝経・任脈を意識して胃の働きやすい体勢へ整えます。'
  },
  {
    title:'吐き気',
    url:'https://gene-seitai.com/nausea.html',
    keywords:['吐き気を感じることがある','胃の不快感がある','乗り物酔いしやすい','めまいがする','喉が詰まる感じがする','食欲がない'],
    medical:'前庭—自律神経反射、胃運動低下、迷走神経反応、過換気、頸部緊張、ストレス性悪心を確認します。',
    tcm:'胃気上逆、肝胃不和、痰湿、脾胃虚弱を中心に、めまい・胃部不快・喉の詰まりの併発で整理します。',
    treatment:'みぞおち、横隔膜、頸部、後頭部、腹部を確認し、任脈・胃経・脾経・肝経の反応を見ながら胃気を下げる方向で調整します。'
  },
  {
    title:'息苦しさ',
    url:'https://gene-seitai.com/breathing-difficulty.html',
    keywords:['息が吸いにくい','深呼吸がしづらい','息苦しさを感じることがある','胸が苦しくなることがある','首こりがある','背中が張りやすい'],
    medical:'呼吸パターン障害、胸郭可動性低下、横隔膜機能低下、過換気傾向、交感神経優位を確認します。',
    tcm:'肺気不宣、肝気鬱結、気滞、痰湿、腎不納気を見立て、吸いにくさ・胸の詰まり・不安感の関係を整理します。',
    treatment:'胸郭、肋間、横隔膜、頸部前面、背部上位胸椎を確認し、肺経・任脈・肝経・腎経を意識して呼吸の通りを整えます。'
  },
  {
    title:'喉の違和感',
    url:'https://gene-seitai.com/throat-discomfort.html',
    keywords:['喉が詰まる感じがする','飲み込みにくさを感じる','口が渇きやすい','息が吸いにくい','理由のない緊張感がある','不安を感じやすい'],
    medical:'咽喉頭異常感、頸部筋緊張、嚥下関連筋の過緊張、ストレス反応、呼吸パターン異常を確認します。',
    tcm:'梅核気、肝気鬱結、痰気交阻、陰虚を中心に、喉の詰まり・胸の詰まり・不安感の連動で見ます。',
    treatment:'舌骨周囲、胸鎖乳突筋、前頸部、胸郭入口部、みぞおちを確認し、任脈・肝経・肺経を意識して上焦の詰まりを緩めます。'
  },
  {
    title:'アトピー・皮膚症状',
    url:'https://gene-seitai.com/atopy.html',
    keywords:['皮膚がかゆくなりやすい','湿疹や肌荒れが出やすい','肌が乾燥しやすい','浸出液が出る','皮膚がポロポロと落ちる','寝汗をかく','顔がほてりやすい'],
    medical:'皮膚バリア機能、掻痒—掻破サイクル、睡眠低下、ストレス応答、神経免疫反応、発汗・体温調整を確認します。',
    tcm:'血熱、血虚風燥、湿熱、脾虚湿盛、陰虚内熱を中心に、乾燥型・滲出型・熱感型で整理します。',
    treatment:'背部、胸郭、腹部、頸部、皮膚緊張、睡眠状態を確認し、肺経・脾経・肝経・腎経を意識して熱・湿・乾燥の偏りを整えます。'
  },
  {
    title:'冷え性・PMS',
    url:'https://gene-seitai.com/cold-sensitivity.html',
    keywords:['手足や体が冷えやすい','寒暖差に弱い','生理周期が乱れやすい','生理痛が強い','生理前に体調が大きく崩れる','のぼせやすい'],
    medical:'末梢循環、体温調整、自律神経性血管反応、骨盤内循環、ホルモン周期に伴う反応性を確認します。',
    tcm:'陽虚、気血不足、瘀血、肝鬱、腎虚を中心に、冷え・のぼせ・月経前症状の出方で整理します。',
    treatment:'骨盤、下腹部、腰仙部、下腿内側、足部を確認し、腎経・脾経・肝経・任脈を意識して下焦の巡りと熱産生を整えます。'
  },
  {
    title:'顎関節症・腱鞘炎・足底筋膜炎',
    url:'https://gene-seitai.com/menu.html',
    keywords:['顎関節症','腱鞘炎','足底筋膜炎','手足がしびれることがある','体がこわばりやすい','肩こりがある','腰に違和感がある'],
    medical:'局所負荷だけでなく、姿勢制御、筋膜連鎖、末梢神経の滑走性、交感神経性筋緊張、反復負荷を確認します。',
    tcm:'気滞血瘀、寒湿、肝血不足、腎虚を背景に、痛みの部位・冷え・こわばり・反復動作の影響で整理します。',
    treatment:'患部のみでなく、頸胸部、肩甲帯、骨盤、足部、前腕ラインを確認し、経筋の連動と荷重バランスを整えます。'
  }
];

function getClinicalTone(breakdown, total){
  const active = breakdown.filter(v => v.selected > 0).sort((a,b)=>b.selected-a.selected || b.ratio-a.ratio);
  if (!active.length) return '現時点では選択項目がないため、医学的な傾向判定は行っていません。';
  const names = active.slice(0,4).map(v=>`${v.name}${v.selected}項目`).join('、');
  const has = (n)=>active.some(v=>v.name===n);
  const phrases = [];
  if (has('睡眠') || has('精神・感情')) phrases.push('交感神経優位・過覚醒・HPA軸ストレス反応');
  if (has('頭・神経系')) phrases.push('前庭—自律神経連関、頸部固有感覚、頭頸部筋緊張');
  if (has('心臓・血圧・循環') || has('呼吸')) phrases.push('心肺自律神経反応、呼吸パターン異常、胸郭可動性低下');
  if (has('消化器')) phrases.push('脳腸相関、内臓知覚過敏、迷走神経機能');
  if (has('皮膚・発汗')) phrases.push('神経免疫反応、皮膚バリア、発汗・体温調整');
  if (has('筋肉・関節')) phrases.push('筋膜性緊張、姿勢制御、交感神経性筋緊張');
  if (!phrases.length) phrases.push('自律神経による全身調整負担');
  return `選択分布は ${names} が中心です。医学的には、${phrases.join('、')} などを背景要因として確認する構成です。これは診断ではなく、施術前に身体反応を整理するための見立てです。`;
}

function getMatchedSymptomInsights(selectedSet){
  const selected = Array.from(selectedSet || []);
  return symptomKnowledgeBase.map(info => {
    let score = 0;
    selected.forEach(item => {
      info.keywords.forEach(key => {
        if (item === key || item.includes(key) || key.includes(item)) score += item === key ? 3 : 1;
      });
    });
    return {...info, score};
  }).filter(v=>v.score>0).sort((a,b)=>b.score-a.score).slice(0,5);
}

function buildHpSymptomLinks(insights){
  if (!insights.length) return '<div class="top-category-item"><span>該当する症状ページ候補はまだありません。</span></div>';
  return insights.map(v => `<a class="symptom-link-chip" href="${v.url}" target="_blank" rel="noopener">${v.title}</a>`).join('');
}

function buildMedicalInterpretationText(breakdown, selectedSet){
  const insights = getMatchedSymptomInsights(selectedSet);
  const base = getClinicalTone(breakdown, Array.from(selectedSet || []).length);
  if (!insights.length) return base;
  const detail = insights.slice(0,3).map(v => `【${v.title}】${v.medical}`).join(' ');
  return `${base} 関連症状ページの内容と照合すると、${detail}`;
}

function buildTcmPatternText(selectedSet){
  const insights = getMatchedSymptomInsights(selectedSet);
  if (!insights.length) return '東洋医学的には、気血水・五臓・寒熱・虚実の偏りを問診と触診で確認します。症状名だけで決めつけず、脈・腹部・呼吸・皮膚緊張・姿勢の反応を合わせて見立てます。';
  return insights.slice(0,4).map(v => `【${v.title}】${v.tcm}`).join(' ');
}

function buildTreatmentViewText(selectedSet){
  const insights = getMatchedSymptomInsights(selectedSet);
  if (!insights.length) return '施術では、首肩だけでなく、呼吸・腹部・背部・骨盤・足部まで確認し、身体が防御反応を起こしにくい刺激量で調整します。';
  const main = insights.slice(0,4).map(v => `【${v.title}】${v.treatment}`).join(' ');
  return `${main} 共通して、強い矯正ではなく、呼吸・循環・筋緊張・内臓反応が落ち着く範囲で全身の連動を整えます。`;
}

function renderClinicalBlocks(breakdown, selectedSet){
  const insights = getMatchedSymptomInsights(selectedSet);
  if (refs.hpSymptomLinks) refs.hpSymptomLinks.innerHTML = buildHpSymptomLinks(insights);
  if (refs.medicalInterpretation) refs.medicalInterpretation.textContent = buildMedicalInterpretationText(breakdown, selectedSet);
  if (refs.tcmPatternText) refs.tcmPatternText.textContent = buildTcmPatternText(selectedSet);
  if (refs.treatmentViewText) refs.treatmentViewText.textContent = buildTreatmentViewText(selectedSet);
}

function setPrintHtml(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = value || '-';
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
    return 'まだ選択項目がないため、自律神経・呼吸・循環・消化・睡眠との関連を含む詳細分析は表示されていません。';
  }
  const names = active.slice(0,3).map(v => `${v.name}（${v.selected}項目）`).join('、');
  const selectedSet = state.selected || new Set();
  const insights = getMatchedSymptomInsights(selectedSet).slice(0,3).map(v=>v.title).join('、');
  const clinical = getClinicalTone(breakdown, total);
  const related = insights ? `HP症状ページでは ${insights} と関連しやすい構成です。` : '';
  return `今回のチェックでは合計${total}項目が選択されています。特に ${names} の比重が高く、${clinical} ${related}`;
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
    let desc = '自律神経・気血水・筋緊張との関連を確認する領域です。';
    if (['頭・神経系','睡眠','精神・感情'].includes(item.name)) desc = '交感神経優位、過覚醒、頸部緊張、睡眠覚醒リズムと関わりやすい領域です。';
    if (['心臓・血圧・循環','呼吸','消化器','全身・体調'].includes(item.name)) desc = '呼吸・循環・消化を介した自律神経反応として確認したい領域です。';
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
      renderClinicalBlocks(breakdown, new Set(currentRec.selectedItems || []));
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
      renderClinicalBlocks(breakdown, new Set(currentRec.selectedItems || []));
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
      renderClinicalBlocks(breakdown, new Set(currentRec.selectedItems || []));
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
  setPrintHtml('printHpSymptomLinks', buildHpSymptomLinks(getMatchedSymptomInsights(selectedSet)));
  setPrintText('printMedicalInterpretation', buildMedicalInterpretationText(breakdown, selectedSet));
  setPrintText('printTcmPattern', buildTcmPatternText(selectedSet));
  setPrintText('printTreatmentView', buildTreatmentViewText(selectedSet));
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
