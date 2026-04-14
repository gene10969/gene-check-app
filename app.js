const categories = [{"name": "全身・体調", "items": ["慢性的に疲れやすい", "休んでも疲れが取れない", "朝起きるのがつらい", "体が重だるい", "微熱が続くことがある", "のぼせやすい", "手足や体が冷えやすい", "寒暖差に弱い", "記憶力が低下している気がする"]}, {"name": "心臓・血圧・循環", "items": ["動悸がする", "脈が乱れる感じがある", "胸が苦しくなることがある", "息切れしやすい", "血圧が不安定だと感じる"]}, {"name": "消化器", "items": ["食欲がない", "食欲が出すぎる", "胃もたれしやすい", "胃の不快感がある", "吐き気を感じることがある", "お腹が張りやすい", "便秘になりやすい", "下痢をしやすい", "便秘と下痢を繰り返す"]}, {"name": "呼吸", "items": ["息が吸いにくい", "深呼吸がしづらい", "息苦しさを感じることがある"]}, {"name": "頭・神経系", "items": ["頭痛がする", "頭が締め付けられる感じがする", "頭がぼーっとする", "集中力が続かない", "めまいがする", "立ちくらみがある", "ふらつく感じがある", "耳鳴りがする"]}, {"name": "睡眠", "items": ["寝つきが悪い", "夜中に目が覚める", "朝早く目が覚めてしまう", "眠りが浅い", "夢をよく見る", "寝てもスッキリしない"]}, {"name": "筋肉・関節", "items": ["首こりがある", "肩こりがある", "背中が張りやすい", "腰に違和感がある", "体がこわばりやすい", "手足がしびれることがある", "筋肉がピクピク動くことがある"]}, {"name": "精神・感情", "items": ["不安を感じやすい", "理由のない緊張感がある", "イライラしやすい", "気分が落ち込みやすい", "気持ちの波が大きい", "人前で緊張しやすい", "外出が不安になることがある"]}, {"name": "目・口・喉", "items": ["目が疲れやすい", "目が乾く", "光がまぶしく感じる", "口が渇きやすい", "喉が詰まる感じがする", "飲み込みにくさを感じる"]}, {"name": "排尿・生理", "items": ["トイレが近い", "残尿感がある", "排尿しづらい感じがある", "生理周期が乱れやすい", "生理痛が強い", "生理前に体調が大きく崩れる"]}, {"name": "皮膚・発汗", "items": ["汗をかきやすい", "汗をかきにくい", "寝汗をかく", "手汗・足汗が気になる", "皮膚がかゆくなりやすい", "湿疹や肌荒れが出やすい", "肌が乾燥しやすい", "浸出液が出る", "皮膚がポロポロと落ちる", "顔がほてりやすい"]}, {"name": "感覚・その他", "items": ["音に敏感", "光に敏感", "匂いに敏感", "乗り物酔いしやすい", "天候や気圧の変化で体調が変わる", "季節の変わり目に不調が出やすい"]}];
document.getElementById('check-data').textContent = JSON.stringify(categories);

const state = {
  selected: new Set(),
  installPrompt: null
};

const $ = (id) => document.getElementById(id);

const refs = {
  patientName: $('patientName'),
  visitDate: $('visitDate'),
  selectedCount: $('selectedCount'),
  severityNow: $('severityNow'),
  categoryTotal: $('categoryTotal'),
  metaText: $('metaText'),
  categoryContainer: $('categoryContainer'),
  resultSection: $('resultSection'),
  resultName: $('resultName'),
  resultDate: $('resultDate'),
  resultTotal: $('resultTotal'),
  resultSeverity: $('resultSeverity'),
  judgeComment: $('judgeComment'),
  selectedList: $('selectedList'),
  selectedMeta: $('selectedMeta'),
  barChart: $('barChart'),
  installBtn: $('installBtn'),
  resetBtn: $('resetBtn'),
  resultBtn: $('resultBtn'),
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
  return 'gene_monshin_pwa_full_v1';
}

function saveState() {
  const payload = {
    name: refs.patientName.value,
    date: refs.visitDate.value,
    selected: Array.from(state.selected)
  };
  localStorage.setItem(storageKey(), JSON.stringify(payload));
}

function loadState() {
  const raw = localStorage.getItem(storageKey());
  if (!raw) return;
  try {
    const payload = JSON.parse(raw);
    refs.patientName.value = payload.name || '';
    refs.visitDate.value = payload.date || todayText();
    (payload.selected || []).forEach(v => state.selected.add(v));
  } catch (e) {}
}

function totalItemCount() {
  return categories.reduce((sum, c) => sum + c.items.length, 0);
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

function getCategorySelectedCount(category) {
  return category.items.filter(item => state.selected.has(item)).length;
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
        saveState();
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
  refs.metaText.textContent = `${categories.length}カテゴリ / ${totalItemCount()}項目`;
}

function renderResult() {
  const count = state.selected.size;
  refs.resultName.textContent = refs.patientName.value || '-';
  refs.resultDate.textContent = refs.visitDate.value || '-';
  refs.resultTotal.textContent = count;
  refs.resultSeverity.textContent = currentSeverity(count);
  refs.judgeComment.textContent = judgeText(count);

  const selectedCategories = categories
    .map(c => ({...c, chosen: c.items.filter(item => state.selected.has(item))}))
    .filter(c => c.chosen.length > 0);

  refs.selectedList.innerHTML = '';
  refs.selectedMeta.textContent = `${count}件`;

  if (!selectedCategories.length) {
    const empty = document.createElement('div');
    empty.className = 'selected-group';
    empty.innerHTML = '<h4>未選択</h4><div>まだ選択されていません。</div>';
    refs.selectedList.appendChild(empty);
  } else {
    selectedCategories.forEach(c => {
      const block = document.createElement('div');
      block.className = 'selected-group';
      block.innerHTML = `<h4>${c.name}</h4><ul>${c.chosen.map(v => `<li>${v}</li>`).join('')}</ul>`;
      refs.selectedList.appendChild(block);
    });
  }

  drawChart();
}

function drawChart() {
  const canvas = refs.barChart;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 900;
  const rowHeight = 46;
  const cssHeight = Math.max(500, categories.length * rowHeight + 90);

  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const margin = {top: 24, right: 70, bottom: 24, left: 170};
  const plotWidth = cssWidth - margin.left - margin.right;

  categories.forEach((c, i) => {
    const y = margin.top + i * rowHeight;
    const selected = getCategorySelectedCount(c);
    const total = c.items.length;
    const ratio = total ? selected / total : 0;
    const activeWidth = plotWidth * ratio;

    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = '14px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.name, 12, y + 13);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, margin.left, y, plotWidth, 24, 10);
    ctx.fill();

    if (activeWidth > 0) {
      const grad = ctx.createLinearGradient(margin.left, y, margin.left + activeWidth, y);
      grad.addColorStop(0, '#d9c17e');
      grad.addColorStop(1, '#b8933f');
      ctx.fillStyle = grad;
      roundRect(ctx, margin.left, y, activeWidth, 24, 10);
      ctx.fill();
    }

    ctx.fillStyle = '#f5f0df';
    ctx.fillText(`${selected} / ${total}`, margin.left + plotWidth + 10, y + 13);
  });
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

refs.resultBtn.addEventListener('click', () => {
  renderResult();
  refs.resultSection.hidden = false;
  refs.resultSection.scrollIntoView({behavior: 'smooth', block: 'start'});
});

refs.resetBtn.addEventListener('click', () => {
  state.selected.clear();
  refs.patientName.value = '';
  refs.visitDate.value = todayText();
  saveState();
  renderCategories();
  updateHeader();
  refs.resultSection.hidden = true;
});

refs.backBtn.addEventListener('click', () => {
  window.scrollTo({top: 0, behavior: 'smooth'});
});

refs.printBtn.addEventListener('click', () => window.print());

refs.patientName.addEventListener('input', saveState);
refs.visitDate.addEventListener('change', saveState);

window.addEventListener('resize', () => {
  if (!refs.resultSection.hidden) drawChart();
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
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

refs.visitDate.value = todayText();
loadState();
renderCategories();
updateHeader();
