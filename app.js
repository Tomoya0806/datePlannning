// ---- JS: タブUI・テーマ切替・データ描画・会員ID保存 ----

// Hashナビとタブ切替
const tabs = [...document.querySelectorAll('.tab')];
const panels = [...document.querySelectorAll('.tabpanel')];

function setActiveTab(name) {
  tabs.forEach(btn => {
    const active = btn.dataset.tab === name;
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  panels.forEach(p => {
    p.hidden = p.id !== `panel-${name}`;
  });
  // ハッシュ更新
  if (location.hash !== `#${name}`) {
    history.replaceState(null, '', `#${name}`);
  }
  // フォーカスをタブに戻す（アクセシビリティ）
  const currentTab = document.querySelector(`.tab[data-tab="${name}"]`);
  if (currentTab) currentTab.focus({preventScroll:true});
}

// 初期タブ
const initial = location.hash?.replace('#', '') || 'summary';
setActiveTab(initial);

// クリック/キーボード操作
tabs.forEach((btn, i) => {
  btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
  btn.addEventListener('keydown', (e) => {
    if (['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {
      e.preventDefault();
      let idx = i;
      if (e.key === 'ArrowLeft') idx = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'ArrowRight') idx = (i + 1) % tabs.length;
      if (e.key === 'Home') idx = 0;
      if (e.key === 'End') idx = tabs.length - 1;
      tabs[idx].focus();
    }
    if (['Enter',' '].includes(e.key)) {
      e.preventDefault();
      setActiveTab(btn.dataset.tab);
    }
  });
});

// テーマ切替（light/dark/auto）
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
function getTheme() { return localStorage.getItem('theme') || 'auto'; }
function applyTheme(t) {
  if (t === 'auto') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', t);
  }
}
function cycleTheme() {
  const curr = getTheme();
  const next = curr === 'auto' ? 'dark' : curr === 'dark' ? 'light' : 'auto';
  localStorage.setItem('theme', next);
  applyTheme(next);
  themeToggle.title = `テーマ切替（現在: ${next}）`;
}
applyTheme(getTheme());
themeToggle.addEventListener('click', cycleTheme);

// ---- データ（プランA確定版のみ） ----
const data = {
  meta: { title: 'JST 実行可能な都内デートプラン', today: '2025-08-14', tomorrow: '2025-08-15' },
  timelineToday: [
    { time: '10:00', title: '中央林間 発', detail: '田園都市線→渋谷→JR山手線→神田（約70分、IC概算：東急¥330–380＋JR¥208）', buffer: 10 },
    { time: '12:00', title: '神田ランチ', detail: '徒歩12–15分（疲労時タクシー5分/¥700–1,000）', buffer: 15 },
    { time: '13:20', title: '雑貨・文具（神保町）', detail: '文房堂など。距離1km超→タクシー推奨', buffer: 10 },
    { time: '15:00', title: 'ホテルチェックイン＆休憩', detail: 'Library Cafe で一息', buffer: 0 },
    { time: '17:35', title: 'ホテル→GORO', detail: 'タクシー約10分/¥1,200–1,600（電車可）', buffer: 0 },
    { time: '18:10', title: 'GORO到着（厳守）', detail: '18:30予約', buffer: 20 },
    { time: '20:50', title: '神田→ホテル', detail: 'JRまたはタクシー10分', buffer: 0 }
  ],
  timelineTomorrow: [
    { time: '10:00', title: 'チェックアウト', detail: '荷物預け or ロッカー/宅配' },
    { time: '10:35', title: '新橋→有明（ゆりかもめ）', detail: '約20分。前面展望席は1–2本見送りで確率UP' },
    { time: '11:05', title: 'SMALL WORLDS（90–120分）', detail: '屋内・最終入場18:00' },
    { time: '12:45', title: 'MUJI 東京有明 & Café', detail: '10:00–20:00 / Café 11:00–20:00' },
    { time: '14:05', title: '新橋→渋谷→中央林間', detail: '約60–70分（IC合算¥700–¥800/人）' },
    { time: '15:45', title: '中央林間着→徒歩10分で自宅', detail: '〜16:00到着' }
  ],
  routes: [
    { from:'中央林間', to:'神田', mode:'電車', time:'約70分', fareIC:'約¥540–¥590/人', transfers:1, walk:'駅内中心', elevator:'有（JR神田）', taxi:'—' },
    { from:'神田', to:'ホテル', mode:'電車＋徒歩', time:'20–30分', fareIC:'約¥200/人', transfers:1, walk:'〜400m', elevator:'馬喰町2番出口', taxi:'8–12分/¥1,200–1,600' },
    { from:'ホテル', to:'GORO', mode:'タクシー推奨', time:'約10分', fareIC:'—', transfers:0, walk:'150–250m', elevator:'—', taxi:'同左' },
    { from:'ホテル', to:'有明', mode:'JR＋ゆりかもめ', time:'約40–50分', fareIC:'約¥500台/人', transfers:2, walk:'各200–600m', elevator:'ゆりかもめ全駅', taxi:'短距離¥600–900' }
  ],
  reserve: [
    'ホテル：CI15:00/CO10:00、Library Cafe 10:00–24:00、支払いは現金/クレカ/QR/電子マネー',
    'Tchin-Tchin GORO：18:30予約（18:10着目安）・月–木 17:00–23:30（LO22:00）・無休・クレカ/PayPay可・ドレスコード明記なし（スマートカジュアル推奨）',
    'SMALL WORLDS：9:00–19:00（最終入場18:00）・当日券あり・所要90–120分',
    'MUJI 東京有明：10:00–20:00 / Café&Meal 11:00–20:00',
    'ゆりかもめ：自動運転・全駅エレベーター・前面展望は先頭右側が◎'
  ],
  shopping: {
    ariake: [{ name:'SMALL WORLDS限定ステッカー', size:'A6程度', price:'¥300–¥800', where:'1Fショップ', url:'https://www.smallworlds.jp/' }],
    kanda:  [{ name:'文房堂 紙もの/シール', size:'B6以下', price:'¥300–¥1,500', where:'文房堂 神田本店', url:'https://www.bumpodo.co.jp/' }],
    muji:   [{ name:'PP小物入れ / A7カードケースなど', size:'掌〜B6', price:'¥190–¥990', where:'無印良品 東京有明', url:'https://www.muji.com/jp/ja/shop/detail/046395' }]
  },
  budget: {
    transport: [6000, 8000],   // 2人合計
    admission: [5400, 6000],   // SMALL WORLDS 2人
    meals: { lunch:[3000,4000], dinner:[6000,8000], cafe:[1500,3000] },
    shoppingCaps: [2000, 3000, 5000] // スライダー 0/1/2
  },
  footnotes: [
    { label:'ホテル公式', url:'#', note:'CI15:00/CO10:00、Library Cafe 10:00–24:00' },
    { label:'GORO 公式/媒体', url:'#', note:'営業時間/支払い/無休' },
    { label:'SMALL WORLDS 公式', url:'https://www.smallworlds.jp/', note:'9:00–19:00 最終入場18:00／当日券' },
    { label:'無印 公式（東京有明）', url:'https://www.muji.com/jp/ja/shop/detail/046395', note:'10:00–20:00／Café 11:00–20:00' },
    { label:'ゆりかもめ 公式', url:'https://www.yurikamome.co.jp/', note:'自動運転・全駅EV・運行情報' }
  ]
};

// タイムライン描画
function renderTimeline(list, elId) {
  const el = document.getElementById(elId);
  el.innerHTML = list.map(item => `
    <li>
      <time>${item.time}</time>
      <div>
        <div class="title">${item.title}</div>
        <div class="detail">${item.detail}${item.buffer ? ` / バッファ${item.buffer}分` : ''}</div>
      </div>
    </li>
  `).join('');
}
renderTimeline(data.timelineToday, 'timelineToday');
renderTimeline(data.timelineTomorrow, 'timelineTomorrow');

// ルート表
const routesBody = document.getElementById('routesBody');
routesBody.innerHTML = data.routes.map(r => `
  <tr>
    <td>${r.from} → ${r.to}</td>
    <td>${r.mode}</td>
    <td>${r.time}</td>
    <td>${r.fareIC}</td>
    <td>${r.transfers}</td>
    <td>${r.walk}</td>
    <td>${r.elevator}</td>
    <td>${r.taxi}</td>
  </tr>
`).join('');

// 予約・注意点
const reserveList = document.getElementById('reserveList');
reserveList.innerHTML = data.reserve.map(t => `<li>${t}</li>`).join('');

// 買い物ミッション
const shoppingGrid = document.getElementById('shoppingGrid');
function card(items, title) {
  return `
  <div class="card">
    <h3>${title}</h3>
    <ul class="bullets">
      ${items.map(i => `<li><strong>${i.name}</strong> — ${i.size}／${i.price}／${i.where} ${i.url ? `（<a href="${i.url}" target="_blank" rel="noopener">リンク</a>）` : ''}</li>`).join('')}
    </ul>
  </div>`;
}
shoppingGrid.innerHTML = [
  card(data.shopping.ariake, '有明版（ミュージアム系）'),
  card(data.shopping.kanda, '神田版（文具・紙もの）'),
  card(data.shopping.muji, '無印版（大型店ならでは）'),
].join('');

// 予算
const budgetBody = document.getElementById('budgetBody');
const budgetCap = document.getElementById('budgetCap');
const budgetCapLabel = document.getElementById('budgetCapLabel');

function sumRange([min,max]) { return {min, max}; }
function addRanges(a,b) { return { min: a.min + b.min, max: a.max + b.max }; }

function recalcBudget() {
  const cap = data.budget.shoppingCaps[+budgetCap.value];
  budgetCapLabel.textContent = `¥${cap.toLocaleString()}`;

  const transport = sumRange(data.budget.transport);
  const admission = sumRange(data.budget.admission);
  const meals = ['lunch','dinner','cafe'].map(k => sumRange(data.budget.meals[k]))
    .reduce(addRanges);

  const shopping = { min: cap, max: cap };
  const totalNoShop = addRanges(addRanges(transport, admission), meals);
  const totalWithShop = addRanges(totalNoShop, shopping);

  const rows = [
    ['交通（2人）', transport],
    ['入場（SW 2人）', admission],
    ['飲食（昼・夜・カフェ）', meals],
    ['買い物上限', shopping],
    ['合計', totalWithShop],
  ].map(([label, range]) => `
    <tr><th>${label}</th><td>¥${range.min.toLocaleString()} 〜 ¥${range.max.toLocaleString()}</td></tr>
  `).join('');

  budgetBody.innerHTML = rows;
}
budgetCap.addEventListener('input', recalcBudget);
recalcBudget();

// 脚注
const footnotesList = document.getElementById('footnotesList');
footnotesList.innerHTML = data.footnotes.map(f => `
  <li><a href="${f.url}" target="_blank" rel="noopener">${f.label}</a> — ${f.note}</li>
`).join('');

// SMALL WORLDS 会員ID 保存・表示・コピー（localStorage）
const memberIdInput = document.getElementById('memberId');
const saveBtn = document.getElementById('saveIdBtn');
const copyBtn = document.getElementById('copyIdBtn');
const revealBtn = document.getElementById('revealIdBtn');
const revealed = document.getElementById('revealedId');

// 初期値（保存済みがあれば反映）
const saved = localStorage.getItem('sw_member_id') || '';
memberIdInput.value = saved;

saveBtn.addEventListener('click', () => {
  const v = memberIdInput.value.trim();
  localStorage.setItem('sw_member_id', v);
  revealed.textContent = '';
  alert('会員IDを保存しました（この端末のみ）');
});

copyBtn.addEventListener('click', async () => {
  const v = memberIdInput.value.trim();
  if (!v) { alert('IDが未入力です'); return; }
  try {
    await navigator.clipboard.writeText(v);
    alert('会員IDをコピーしました');
  } catch {
    alert('コピーに失敗しました。手動で選択してください。');
  }
});

revealBtn.addEventListener('click', () => {
  const isOpen = revealBtn.getAttribute('aria-expanded') === 'true';
  const v = memberIdInput.value.trim();
  revealBtn.setAttribute('aria-expanded', String(!isOpen));
  revealed.textContent = !isOpen && v ? `ID: ${v}` : '';
});
