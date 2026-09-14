// Bellogue — 개인 다이어리 확장프로그램

import { extension_settings, getContext } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "bellogue";

const NEIGHBOR_SEED = [
  {
    id: 'nb_raven', name: '레이븐', emoji: '⚓',
    job: '항구 노동자', district: '항구 지구', zodiac: '전갈자리', birthday: '11월 2일',
    intro: '조용히 사는 걸 좋아해요.',
    posts: [{
      id: 'nbp_raven_1', title: '오늘 항구 쪽 안개가 심하네요', date: '9월 12일',
      body: '일이 일찍 끝나서 부둣가에 앉아 있었다. 안개가 짙어서 배들도 다 늦게 들어왔다.',
      image: '',
      comments: [{ id: 'c1', name: '모라', text: '안개 낀 항구, 상상만 해도 운치있네요' }],
    }],
  },
  {
    id: 'nb_mora', name: '모라', emoji: '🧵',
    job: '재봉사', district: '구시가', zodiac: '황소자리', birthday: '5월 14일',
    intro: '손끝으로 하는 일이 제일 편해요.',
    posts: [{
      id: 'nbp_mora_1', title: '새 원단이 들어왔다', date: '9월 11일',
      body: '이번에 들어온 원단이 색이 참 곱다. 누구 옷을 지어볼까 고민중.',
      image: '',
      comments: [{ id: 'c1', name: '실비아', text: '저도 새 옷 한 벌 부탁드려도 될까요?' }],
    }],
  },
  {
    id: 'nb_sylvia', name: '실비아', emoji: '📚',
    job: '서점 점원', district: '대성당 지구', zodiac: '천칭자리', birthday: '10월 3일',
    intro: '책 냄새가 좋아요.',
    posts: [{
      id: 'nbp_sylvia_1', title: '손님이 두고 간 책', date: '9월 10일',
      body: '낯선 손님이 책 한 권을 두고 갔다. 겉표지에 아무 글씨도 없어서 괜히 궁금해진다.',
      image: '',
      comments: [{ id: 'c1', name: '레이븐', text: '무슨 책이었는지 꼭 알려주세요' }],
    }],
  },
];

const DISCOVER_SEED = [
  {
    id: 'nb_theo', name: '테오', emoji: '🔧',
    job: '자동차 정비공', district: '항구 지구', zodiac: '양자리', birthday: '4월 9일',
    intro: '기름때는 훈장 같은 거예요.',
    posts: [{ id: 'nbp_theo_1', title: '엔진 소리로 다 알아요', date: '9월 9일', body: '오늘도 낡은 차 한 대를 고쳤다. 엔진 소리만 들어도 어디가 아픈지 대충 감이 온다.', image: '', comments: [] }],
  },
  {
    id: 'nb_betty', name: '베티', emoji: '☕',
    job: '카페 종업원', district: '대성당 지구', zodiac: '게자리', birthday: '7월 1일',
    intro: '단골손님 얼굴은 다 외워요.',
    posts: [{ id: 'nbp_betty_1', title: '오늘의 단골', date: '9월 8일', body: '항상 같은 자리에 앉는 손님이 오늘은 안 왔다. 별일 없어야 할 텐데.', image: '', comments: [] }],
  },
  {
    id: 'nb_clara', name: '클라라', emoji: '🎹',
    job: '피아노 교습소 선생', district: '구시가', zodiac: '물병자리', birthday: '2월 8일',
    intro: '음악이 없는 밤은 상상할 수 없어요.',
    posts: [{ id: 'nbp_clara_1', title: '새 제자가 왔다', date: '9월 7일', body: '손가락이 짧아 걱정하던 아이였는데, 생각보다 재능이 있는 것 같다.', image: '', comments: [] }],
  },
  {
    id: 'nb_eden', name: '이든', emoji: '📰',
    job: '신문팔이 소년', district: '구시가', zodiac: '쌍둥이자리', birthday: '6월 20일',
    intro: '오늘의 특종이 궁금하면 저를 찾으세요.',
    posts: [{ id: 'nbp_eden_1', title: '오늘 신문 다 팔았다', date: '9월 6일', body: '해 지기 전에 다 팔아서 기분이 좋다. 내일은 더 일찍 나가봐야지.', image: '', comments: [] }],
  },
];

const BOARD_TOPICS = ['잡담', '질문', '정보공유', '후기'];
const BOARD_DEFS = [
  { id: 'notice', name: '공지사항' },
  { id: 'suggest', name: '건의함' },
  { id: 'free', name: '자유게시판' },
  { id: 'job', name: '구인구직' },
  { id: 'market', name: '장터' },
];
const BOARD_TOPIC_MAP = { notice: [], suggest: [], free: BOARD_TOPICS, job: ['구인', '구직'], market: ['팝니다', '삽니다'] };

const ERA_RULE = '중요: 이 글/답글은 반드시 1930~1940년대 가상 도시 "벨 누아"의 세계관 안에서만 작성되어야 합니다. 인터넷, 컴퓨터, 스마트폰, API, 앱, 소프트웨어, SNS, 현대 브랜드 등 21세기적인 개념이나 단어는 절대 언급하지 마세요. 편지, 신문, 전보, 축음기, 자동차, 재봉틀 같은 그 시대에 맞는 소재만 사용하세요.';

const WORLD_GUARD = '아주 중요한 규칙: 당신은 1930~1940년대풍 가상 도시 "벨 누아"의 세계관 안에서만 존재합니다. 인터넷, 스마트폰, 컴퓨터, 앱, API, 전자기기, 게임, SNS, 현대 정치·연예인 등 21세기 현실 요소는 절대 언급하거나 암시하지 마세요. 오직 그 시대에 어울리는 소재(거리, 날씨, 사람, 소문, 생업, 사교 등)만 다루세요.';

const defaultSettings = {
  nickname: "",
  colorTheme: "burgundy",
  language: "ko",
  connectionProfile: "",
  birthday: "",
  zodiac: "",
  district: "",
  job: "",
  intro: "",
  profileImage: "",   // base64 data URL
  posts: [],          // [{ id, title, body, image, date, comments:[{id,name,text}] }]
  neighbors: [],       // [{ id, name, emoji, job, district, zodiac, birthday, intro, posts:[...] }]
  neighborFeed: [],     // [{ neighborId, postId }] 최신순, 최대 5개
  lastFeedNeighborId: "",
  discoverPool: [],     // 발견 탭에 보여줄 NPC 풀, 최대 10명
  discoverPoolSeedVersion: 0,
  neighborSeedVersion: 0,
  boardPosts: [],        // [{ id, boardId, topic, title, body, author, date, comments:[] }]
  lastBoardAuthor: "",
  savedBoardPostIds: [],
};

function getSettings() {
  if (!extension_settings[extensionName]) extension_settings[extensionName] = {};
  const s = extension_settings[extensionName];
  for (const key in defaultSettings) {
    if (s[key] === undefined) s[key] = JSON.parse(JSON.stringify(defaultSettings[key]));
  }
  return s;
}

function applyColorTheme(theme) {
  document.documentElement.setAttribute('data-bellogue-theme', theme);
}

function getConnectionProfiles() {
  const profiles = [{ value: '', label: '메인 프로필 사용 (기본)' }];
  $('#connection_profiles option').each(function () {
    const val = $(this).val();
    const text = $(this).text().trim();
    if (val && text && text !== '<None>') profiles.push({ value: val, label: text });
  });
  return profiles;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function todayStr() {
  return new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

// 처음 한 번(또는 이웃 데이터 구조가 바뀌었을 때), 미리 준비된 이웃 3명으로 교체
const NEIGHBOR_SEED_VERSION = 1;
function ensureNeighborSeeded() {
  const s = getSettings();
  if (s.neighborSeedVersion !== NEIGHBOR_SEED_VERSION || s.neighbors.length === 0) {
    s.neighbors = JSON.parse(JSON.stringify(NEIGHBOR_SEED));
    s.neighborSeedVersion = NEIGHBOR_SEED_VERSION;
  }
  if (s.discoverPoolSeedVersion !== NEIGHBOR_SEED_VERSION || s.discoverPool.length === 0) {
    s.discoverPool = JSON.parse(JSON.stringify(DISCOVER_SEED));
    s.discoverPoolSeedVersion = NEIGHBOR_SEED_VERSION;
  }
  saveSettingsDebounced();
}

const RANDOM_EMOJI_POOL = ['⚓', '🧵', '📚', '🔧', '☕', '🎹', '📰', '⏱️', '🎩', '🍷', '🕯️', '🎻', '🧭', '🗝️', '🐈', '🥂'];

// "새 글 보기" — 내 이웃 중 한 명을 골라 AI로 새 일기를 생성, 최근 5개 피드에 반영 (직전과 같은 이웃은 되도록 피함)
async function generateNeighborFeedPost() {
  const s = getSettings();
  if (s.neighbors.length === 0) return { ok: false };
  let candidates = s.neighbors;
  if (s.neighbors.length > 1 && s.lastFeedNeighborId) {
    candidates = s.neighbors.filter(n => n.id !== s.lastFeedNeighborId);
  }
  const neighbor = candidates[Math.floor(Math.random() * candidates.length)];
  const langLine = s.language === 'en' ? 'Respond in English.' : '한국어로 답하세요.';
  const prompt = `${WORLD_GUARD}
당신은 1930년대풍 가상 도시 "벨 누아"에 사는 주민 "${neighbor.name}"입니다. 직업은 ${neighbor.job}, 거주구역은 ${neighbor.district}입니다. 오늘 새로 쓴 짧은 일기를 아래 JSON 형식으로만 답하세요. 다른 설명은 붙이지 마세요.
{"title":"제목","body":"본문 (2~3문장, 1인칭)"}
${ERA_RULE}
${langLine}`;

  try {
    const context = getContext();
    const raw = await context.generateQuietPrompt(prompt, false, false);
    const match = String(raw).match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no JSON in response');
    const data = JSON.parse(match[0]);
    const post = {
      id: 'nbp_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      title: data.title || '오늘 하루',
      body: data.body || '별일 없이 지나간 하루였다.',
      image: '', date: todayStr(), comments: [],
    };
    const s2 = getSettings();
    const n2 = s2.neighbors.find(n => n.id === neighbor.id);
    n2.posts.unshift(post);
    s2.neighborFeed.unshift({ neighborId: neighbor.id, postId: post.id });
    if (s2.neighborFeed.length > 5) s2.neighborFeed.length = 5;
    s2.lastFeedNeighborId = neighbor.id;
    saveSettingsDebounced();
    return { ok: true };
  } catch (e) {
    console.warn('[Bellogue] 이웃 새 글 생성 실패:', e);
    return { ok: false };
  }
}

// 발견 탭 새로고침 — AI로 새로운 벨 누아 주민을 한 명 만들어 발견 풀에 추가 (최대 10명, 넘으면 오래된 것부터 밀려남)
async function generateDiscoverNeighbor() {
  const s = getSettings();
  const existingNames = [...s.neighbors, ...s.discoverPool].map(n => n.name).join(', ');
  const langLine = s.language === 'en' ? 'Respond in English.' : '한국어로 답하세요.';
  const prompt = `${WORLD_GUARD}
1930년대풍 가상 도시 "벨 누아"에 사는 새로운 주민 한 명을 만들어주세요. 이미 존재하는 주민(${existingNames})과 겹치지 않는 이름으로 해주세요.
이름은 반드시 서구풍 1930년대 분위기로 지어주세요 (예: 레이븐, 모라, 실비아, 테오, 이든, 베티, 클라라, 안톤 같은 느낌). 현실적인 한국 이름이나 실존 인물, 유명인 이름은 절대 쓰지 마세요.
아래 JSON 형식으로만 답하세요. 다른 설명은 붙이지 마세요.
{"name":"이름(한 단어)","job":"직업(짧게)","district":"거주구역(짧게)","zodiac":"별자리","birthday":"생년월일 (예: 3월 4일)","intro":"한줄 소개 (20자 내외)","postTitle":"오늘 쓴 일기 제목","postBody":"오늘 쓴 일기 본문 (2~3문장, 1인칭)"}
${ERA_RULE}
${langLine}`;

  try {
    const context = getContext();
    const raw = await context.generateQuietPrompt(prompt, false, false);
    const match = String(raw).match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no JSON in response');
    const data = JSON.parse(match[0]);
    const npc = {
      id: 'nb_gen_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: data.name || '새로운 주민',
      emoji: RANDOM_EMOJI_POOL[Math.floor(Math.random() * RANDOM_EMOJI_POOL.length)],
      job: data.job || '', district: data.district || '', zodiac: data.zodiac || '',
      birthday: data.birthday || '', intro: data.intro || '',
      posts: [{
        id: 'nbp_' + Date.now(), title: data.postTitle || '오늘 하루',
        body: data.postBody || '별일 없이 지나간 하루였다.',
        image: '', date: todayStr(), comments: [],
      }],
    };
    const s2 = getSettings();
    s2.discoverPool.unshift(npc);
    if (s2.discoverPool.length > 10) s2.discoverPool.length = 10;
    saveSettingsDebounced();
    return { ok: true };
  } catch (e) {
    console.warn('[Bellogue] 발견 새 주민 생성 실패:', e);
    return { ok: false };
  }
}

// ── 확장프로그램 관리 탭 설정 패널 ──────────────────────────────
jQuery(async () => {
  const settings = getSettings();
  applyColorTheme(settings.colorTheme);

  $('#extensionsMenu').append(`
    <div id="bellogue-menu-button" class="list-group-item flex-container flexGap5">
        <div class="fa-solid fa-book extensionsMenuExtensionButton"></div>
        <span>Bellogue</span>
    </div>`);
  $('#bellogue-menu-button').on('click', openBellogueModal);

  const profileOptions = getConnectionProfiles().map(p => `<option value="${p.value}">${p.label}</option>`).join('');

  $('#extensions_settings2').append(`
    <div id="bellogue-settings">
      <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
          <b>Bellogue</b>
          <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content">

          <label for="bellogue-nickname">내 필명</label>
          <input id="bellogue-nickname" type="text" class="text_pole" placeholder="예: 클로이">

          <label for="bellogue-color-theme">포인트 컬러</label>
          <select id="bellogue-color-theme" class="text_pole">
            <option value="burgundy">와인 버건디</option>
            <option value="slate">소프트 슬레이트 블루</option>
            <option value="sage">소프트 세이지 올리브</option>
            <option value="rose">더스티 로즈</option>
          </select>

          <div class="bellogue-settings-label">출력 언어</div>
          <div class="bellogue-radio-row">
            <label><input type="radio" name="bellogue-language" value="ko"><span>🇰🇷 한국어</span></label>
            <label><input type="radio" name="bellogue-language" value="en"><span>🇺🇸 English</span></label>
          </div>

          <label for="bellogue-connection-profile">연결 프로필</label>
          <select id="bellogue-connection-profile" class="text_pole">${profileOptions}</select>

          <div class="bellogue-settings-label" style="margin-top:12px;">프로필 정보</div>
          <label for="bellogue-birthday">🎂 생년월일</label>
          <input id="bellogue-birthday" type="text" class="text_pole" placeholder="예: 3월 4일">
          <label for="bellogue-zodiac">✨ 별자리</label>
          <input id="bellogue-zodiac" type="text" class="text_pole" placeholder="예: 물고기자리">
          <label for="bellogue-district">📍 거주구역</label>
          <input id="bellogue-district" type="text" class="text_pole" placeholder="예: 항구 지구">
          <label for="bellogue-job">💼 직업</label>
          <input id="bellogue-job" type="text" class="text_pole" placeholder="예: 카페 바리스타">
          <label for="bellogue-intro">한줄 소개</label>
          <input id="bellogue-intro" type="text" class="text_pole" placeholder="짧은 자기소개">

        </div>
      </div>
    </div>
  `);

  const fields = ['nickname', 'birthday', 'zodiac', 'district', 'job', 'intro'];
  fields.forEach(f => {
    $(`#bellogue-${f}`).val(settings[f]).on('input', function () {
      settings[f] = $(this).val();
      saveSettingsDebounced();
    });
  });
  $('#bellogue-color-theme').val(settings.colorTheme).on('change', function () {
    settings.colorTheme = $(this).val();
    applyColorTheme(settings.colorTheme);
    saveSettingsDebounced();
  });
  $(`input[name="bellogue-language"][value="${settings.language}"]`).prop('checked', true);
  $('input[name="bellogue-language"]').on('change', function () {
    settings.language = $(this).val();
    saveSettingsDebounced();
  });
  $('#bellogue-connection-profile').val(settings.connectionProfile).on('change', function () {
    settings.connectionProfile = $(this).val();
    saveSettingsDebounced();
  });
});

// ── 모달 ─────────────────────────────────────────────────────
function openBellogueModal() {
  let dialog = document.getElementById('bellogue-dialog');
  if (!dialog) dialog = buildBellogueDialog();
  dialog._manageMode = false;
  dialog._mobileSub = 'profile';
  dialog._neighborView = null;
  dialog._neighborMobileSub = 'friends';
  dialog._neighborManageMode = false;
  dialog._boardView = null;
  dialog._boardTab = 'free';
  dialog._boardWriteOpen = false;
  dialog._boardShowSaved = false;
  showCover(dialog);
  dialog.showModal();
}

function buildBellogueDialog() {
  const dialog = document.createElement('dialog');
  dialog.id = 'bellogue-dialog';
  dialog.innerHTML = `
    <div class="bellogue-frame">
      <div class="bellogue-scroll" id="bellogue-scroll"></div>
    </div>
    <div class="bellogue-index-tabs" id="bellogue-index-tabs"></div>
  `;
  document.body.appendChild(dialog);

  dialog.addEventListener('click', function (e) {
    const rect = dialog.getBoundingClientRect();
    const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });

  return dialog;
}

const BELLOGUE_TABS = [
  { id: 'blog', label: '내 벨로그' },
  { id: 'neighbor', label: '이웃 벨로그' },
  { id: 'board', label: '주민센터' },
];

function showCover(dialog) {
  const scroll = dialog.querySelector('#bellogue-scroll');
  const tabsBox = dialog.querySelector('#bellogue-index-tabs');
  tabsBox.innerHTML = '';
  dialog.classList.remove('bellogue-open');

  scroll.innerHTML = `
    <div class="bellogue-cover">
      <div class="bellogue-cover-icon"><i class="fa-solid fa-moon"></i></div>
      <div class="bellogue-cover-rule"></div>
      <p class="bellogue-logo">BELLOGUE</p>
      <button id="bellogue-open-btn" class="bellogue-open-btn">OPEN</button>
    </div>
  `;
  scroll.querySelector('#bellogue-open-btn').addEventListener('click', function () {
    dialog.classList.add('bellogue-open');
    showTab(dialog, 'blog');
  });
}

function renderIndexTabs(dialog, active) {
  const tabsBox = dialog.querySelector('#bellogue-index-tabs');
  tabsBox.innerHTML = BELLOGUE_TABS.map(t =>
    `<div class="bellogue-index-tab${t.id === active ? ' active' : ''}" data-tab="${t.id}">${t.label}</div>`
  ).join('');
  tabsBox.querySelectorAll('.bellogue-index-tab').forEach(el => {
    el.addEventListener('click', () => showTab(dialog, el.dataset.tab));
  });
}

function showTab(dialog, name) {
  dialog._activeTab = name;
  renderIndexTabs(dialog, name);
  const scroll = dialog.querySelector('#bellogue-scroll');
  if (name === 'board') {
    scroll.innerHTML = boardHtml(dialog);
    wireBoardEvents(dialog);
  } else if (name === 'neighbor') {
    scroll.innerHTML = neighborTabHtml(dialog);
    wireNeighborEvents(dialog);
  } else {
    scroll.innerHTML = blogHtml(dialog);
    wireBlogEvents(dialog);
  }
}

// ── 내 벨로그 (프로필 + 피드) ────────────────────────────────
function blogHtml(dialog) {
  const s = getSettings();
  const sub = dialog._mobileSub || 'profile';
  return `
    <div class="bellogue-mobile-subtabs">
      <span data-sub="profile" class="${sub === 'profile' ? 'active' : ''}">프로필</span>
      <span data-sub="feed" class="${sub === 'feed' ? 'active' : ''}">피드</span>
    </div>
    <div class="bellogue-page bellogue-profile-page${sub === 'profile' ? ' bellogue-mobile-active' : ''}">${profileHtml(s)}</div>
    <div class="bellogue-page bellogue-feed-page${sub === 'feed' ? ' bellogue-mobile-active' : ''}">${feedHtml(s, !!dialog._manageMode)}</div>
  `;
}

function profileHtml(s) {
  const avatarBg = s.profileImage ? `background-image:url('${s.profileImage}');background-size:cover;background-position:center;` : '';
  const recent = s.posts.slice(0, 2);
  const recentHtml = recent.length
    ? recent.map(p => `<p class="bellogue-recent-row"><span>${escapeHtml(p.title)}</span><span class="bellogue-meta">${escapeHtml(p.date)}</span></p>`).join('')
    : `<p class="bellogue-placeholder-sm">아직 쓴 글이 없어요</p>`;

  return `
    <div class="bellogue-avatar" id="bellogue-avatar" style="${avatarBg}">
      ${s.profileImage ? '' : '<i class="fa-solid fa-moon"></i>'}
      <span class="bellogue-avatar-cam"><i class="fa-solid fa-camera"></i></span>
    </div>
    <input type="file" id="bellogue-avatar-input" accept="image/*" style="display:none;">
    <p class="bellogue-name">${escapeHtml(s.nickname) || '이름 없음'}</p>
    <div class="bellogue-info-grid">
      ${s.birthday ? `<span>🎂 ${escapeHtml(s.birthday)}</span>` : ''}
      ${s.zodiac ? `<span>✨ ${escapeHtml(s.zodiac)}</span>` : ''}
      ${s.district ? `<span>📍 ${escapeHtml(s.district)}</span>` : ''}
      ${s.job ? `<span>💼 ${escapeHtml(s.job)}</span>` : ''}
    </div>
    ${s.intro ? `<p class="bellogue-intro">"${escapeHtml(s.intro)}"</p>` : ''}
    <div class="bellogue-section-tag">✍ 최근 글</div>
    <div class="bellogue-recent-list">${recentHtml}</div>
  `;
}

function feedHtml(s, manageMode) {
  const rowsHtml = s.posts.length
    ? s.posts.map(p => feedRowHtml(p, manageMode)).join('')
    : `<p class="bellogue-placeholder">아직 쓴 글이 없어요.<br>글쓰기로 첫 글을 남겨보세요.</p>`;

  return `
    <div class="bellogue-feed-header">
      <span id="bellogue-manage-btn" class="bellogue-icon-btn" title="글 관리"><i class="fa-solid fa-gear"></i></span>
      <span id="bellogue-write-btn" class="bellogue-write-btn"><i class="fa-solid fa-feather"></i> 글쓰기</span>
    </div>
    <div class="bellogue-post-list">${rowsHtml}</div>
  `;
}

function feedRowHtml(post, manageMode) {
  const editDel = manageMode ? `
    <span class="bellogue-post-edit" data-id="${post.id}">수정</span>
    <span class="bellogue-post-delete" data-id="${post.id}">삭제</span>` : '';
  const thumb = post.image ? `<div class="bellogue-row-thumb" style="background-image:url('${post.image}')"></div>` : '';
  return `
    <div class="bellogue-post-row" data-id="${post.id}">
      ${thumb}
      <div class="bellogue-row-main">
        <p class="bellogue-post-title">${escapeHtml(post.title)}</p>
        <span class="bellogue-meta">${escapeHtml(post.date)}</span>
      </div>
      <div class="bellogue-row-actions">${editDel}</div>
    </div>
  `;
}

function postHtml(post, manageMode) {
  const s = getSettings();
  const img = post.image ? `<div class="bellogue-post-image" style="background-image:url('${post.image}')"></div>` : '';
  const editDel = manageMode ? `
    <span class="bellogue-post-edit" data-id="${post.id}">수정</span>
    <span class="bellogue-post-delete" data-id="${post.id}">삭제</span>` : '';
  const bodyHtml = post.body.split(/\n+/).map(p => p.trim()).filter(Boolean)
    .map((p, i) => `<p class="bellogue-post-para${i === 0 ? ' bellogue-dropcap' : ''}">${escapeHtml(p)}</p>`).join('');
  const commentsList = (post.comments || []).map(c => `
    <div class="bellogue-comment-row">
      <p><span class="bellogue-comment-name">${escapeHtml(c.name)}</span> ${escapeHtml(c.text)}</p>
      ${manageMode ? `<span class="bellogue-comment-delete" data-post="${post.id}" data-comment="${c.id}">삭제</span>` : ''}
    </div>`).join('');
  const commentsBox = (post.comments || []).length
    ? `<div class="bellogue-comments-box">
        <div class="bellogue-section-tag">💬 댓글 ${post.comments.length}</div>
        ${commentsList}
      </div>`
    : `<div class="bellogue-section-tag">💬 댓글 0</div>`;

  return `
    <div class="bellogue-post" data-id="${post.id}">
      <p id="bellogue-write-back" class="bellogue-back-link"><i class="fa-solid fa-arrow-left"></i> 목록으로</p>
      <div class="bellogue-post-headrow">
        <span class="bellogue-meta-badge">${escapeHtml(post.date)}</span>
        ${editDel}
      </div>
      <p class="bellogue-post-title-lg">${escapeHtml(post.title)}</p>
      <p class="bellogue-post-subtitle">${escapeHtml(s.nickname) || '이름 없음'}의 벨로그</p>
      ${img}
      <div class="bellogue-post-body">${bodyHtml}</div>
      ${commentsBox}
    </div>
  `;
}

function showPostDetail(dialog, postId) {
  const s = getSettings();
  const post = s.posts.find(p => p.id === postId);
  if (!post) return;
  const scroll = dialog.querySelector('#bellogue-scroll');
  scroll.innerHTML = postHtml(post, !!dialog._manageMode);

  scroll.querySelector('#bellogue-write-back').addEventListener('click', () => { dialog._mobileSub = 'feed'; showTab(dialog, 'blog'); });
  const editEl = scroll.querySelector('.bellogue-post-edit');
  if (editEl) editEl.addEventListener('click', () => showWrite(dialog, post.id));
  const delEl = scroll.querySelector('.bellogue-post-delete');
  if (delEl) delEl.addEventListener('click', () => {
    if (!confirm('이 글을 삭제할까요?')) return;
    const s2 = getSettings();
    s2.posts = s2.posts.filter(p => p.id !== post.id);
    saveSettingsDebounced();
    dialog._mobileSub = 'feed';
    showTab(dialog, 'blog');
  });
  scroll.querySelectorAll('.bellogue-comment-delete').forEach(el => {
    el.addEventListener('click', function () {
      if (!confirm('이 댓글을 삭제할까요?')) return;
      const s2 = getSettings();
      const p2 = s2.posts.find(p => p.id === this.dataset.post);
      if (p2) p2.comments = (p2.comments || []).filter(c => c.id !== this.dataset.comment);
      saveSettingsDebounced();
      showPostDetail(dialog, postId);
    });
  });
}

// ── 이미지 크롭 (프로필/글 이미지 공용) ──────────────────────
function showImageCropper(dialog, srcDataUrl, frameW, frameH, outW, outH, onConfirm, onCancel) {
  const scroll = dialog.querySelector('#bellogue-scroll');

  scroll.innerHTML = `
    <div class="bellogue-crop">
      <p class="bellogue-back-link" id="bellogue-crop-cancel"><i class="fa-solid fa-arrow-left"></i> 취소</p>
      <div class="bellogue-crop-frame" id="bellogue-crop-frame" style="width:${frameW}px;height:${frameH}px;">
        <img id="bellogue-crop-img" src="${srcDataUrl}" draggable="false">
      </div>
      <input type="range" id="bellogue-crop-zoom" min="1" max="3" step="0.01" value="1" class="bellogue-crop-zoom">
      <div class="bellogue-write-actions">
        <button id="bellogue-crop-confirm" class="bellogue-btn-primary" type="button">확인</button>
      </div>
    </div>
  `;

  scroll.querySelector('#bellogue-crop-cancel').addEventListener('click', onCancel);

  const img = scroll.querySelector('#bellogue-crop-img');
  const frame = scroll.querySelector('#bellogue-crop-frame');
  const zoomInput = scroll.querySelector('#bellogue-crop-zoom');

  let baseScale = 1, zoom = 1, offX = 0, offY = 0;
  let dragging = false, startX = 0, startY = 0, startOffX = 0, startOffY = 0;

  function clampOffsets() {
    const dispW = img.naturalWidth * baseScale * zoom;
    const dispH = img.naturalHeight * baseScale * zoom;
    offX = Math.min(0, Math.max(frameW - dispW, offX));
    offY = Math.min(0, Math.max(frameH - dispH, offY));
  }
  function render() {
    clampOffsets();
    const dispW = img.naturalWidth * baseScale * zoom;
    const dispH = img.naturalHeight * baseScale * zoom;
    img.style.width = dispW + 'px';
    img.style.height = dispH + 'px';
    img.style.left = offX + 'px';
    img.style.top = offY + 'px';
  }

  img.onload = function () {
    baseScale = Math.max(frameW / img.naturalWidth, frameH / img.naturalHeight);
    offX = (frameW - img.naturalWidth * baseScale) / 2;
    offY = (frameH - img.naturalHeight * baseScale) / 2;
    render();
  };
  if (img.complete && img.naturalWidth) img.onload();

  zoomInput.addEventListener('input', function () {
    zoom = parseFloat(this.value);
    render();
  });

  function pointerDown(e) {
    dragging = true;
    const p = e.touches ? e.touches[0] : e;
    startX = p.clientX; startY = p.clientY;
    startOffX = offX; startOffY = offY;
  }
  function pointerMove(e) {
    if (!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    offX = startOffX + (p.clientX - startX);
    offY = startOffY + (p.clientY - startY);
    render();
    e.preventDefault();
  }
  function pointerUp() { dragging = false; }

  frame.addEventListener('mousedown', pointerDown);
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);
  frame.addEventListener('touchstart', pointerDown, { passive: true });
  frame.addEventListener('touchmove', pointerMove, { passive: false });
  frame.addEventListener('touchend', pointerUp);

  scroll.querySelector('#bellogue-crop-confirm').addEventListener('click', function () {
    const scaleFactor = baseScale * zoom;
    const sx = -offX / scaleFactor;
    const sy = -offY / scaleFactor;
    const sW = frameW / scaleFactor;
    const sH = frameH / scaleFactor;

    const canvas = document.createElement('canvas');
    canvas.width = outW; canvas.height = outH;
    canvas.getContext('2d').drawImage(img, sx, sy, sW, sH, 0, 0, outW, outH);

    if (!dialog.open) dialog.showModal();
    onConfirm(canvas.toDataURL('image/jpeg', 0.85));
  });
}

function wireBlogEvents(dialog) {
  const scroll = dialog.querySelector('#bellogue-scroll');

  scroll.querySelectorAll('.bellogue-mobile-subtabs span').forEach(el => {
    el.addEventListener('click', function () {
      dialog._mobileSub = this.dataset.sub;
      showTab(dialog, 'blog');
    });
  });

  const avatar = scroll.querySelector('#bellogue-avatar');
  const fileInput = scroll.querySelector('#bellogue-avatar-input');
  avatar.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    // 모바일에서 OS 사진 선택창 때문에 dialog가 백그라운드 처리되어 닫히는 경우 대비
    if (!dialog.open) dialog.showModal();
    const reader = new FileReader();
    reader.onload = () => showImageCropper(dialog, reader.result, 260, 325, 400, 500,
      (dataUrl) => {
        const s = getSettings();
        s.profileImage = dataUrl;
        saveSettingsDebounced();
        showTab(dialog, 'blog');
      },
      () => showTab(dialog, 'blog')
    );
    reader.readAsDataURL(file);
  });

  scroll.querySelector('#bellogue-manage-btn').addEventListener('click', function () {
    dialog._manageMode = !dialog._manageMode;
    showTab(dialog, 'blog');
  });

  scroll.querySelector('#bellogue-write-btn').addEventListener('click', function () {
    showWrite(dialog, null);
  });

  scroll.querySelectorAll('.bellogue-post-row').forEach(row => {
    row.addEventListener('click', function (e) {
      if (e.target.closest('.bellogue-row-actions')) return;
      showPostDetail(dialog, this.dataset.id);
    });
  });
  scroll.querySelectorAll('.bellogue-post-edit').forEach(el => {
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      showWrite(dialog, this.dataset.id);
    });
  });
  scroll.querySelectorAll('.bellogue-post-delete').forEach(el => {
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!confirm('이 글을 삭제할까요?')) return;
      const s = getSettings();
      s.posts = s.posts.filter(p => p.id !== this.dataset.id);
      saveSettingsDebounced();
      showTab(dialog, 'blog');
    });
  });
}

// ── 글쓰기 ───────────────────────────────────────────────────
function showWrite(dialog, editingId, draft) {
  const s = getSettings();
  const editingPost = editingId ? s.posts.find(p => p.id === editingId) : null;
  const scroll = dialog.querySelector('#bellogue-scroll');

  const initTitle = draft ? draft.title : (editingPost ? editingPost.title : '');
  const initBody = draft ? draft.body : (editingPost ? editingPost.body : '');
  let pendingImage = draft ? draft.image : (editingPost ? editingPost.image || '' : '');

  const thumbHtml = pendingImage
    ? `<div id="bellogue-write-thumb" class="bellogue-write-thumb" style="background-image:url('${pendingImage}')"><span class="bellogue-write-thumb-edit">변경</span></div>`
    : `<button id="bellogue-write-image-btn" class="bellogue-btn-outline" type="button">이미지 첨부</button>`;

  scroll.innerHTML = `
    <div class="bellogue-write">
      <p id="bellogue-write-back" class="bellogue-back-link"><i class="fa-solid fa-arrow-left"></i> 뒤로</p>
      <input id="bellogue-write-title" type="text" class="bellogue-write-title-input" placeholder="제목을 입력하세요" value="${escapeHtml(initTitle)}">
      <textarea id="bellogue-write-body" class="bellogue-write-textarea" placeholder="오늘 있었던 일을 적어보세요...">${escapeHtml(initBody)}</textarea>
      <input type="file" id="bellogue-write-image-input" accept="image/*" style="display:none;">
      <div class="bellogue-write-image-row">${thumbHtml}</div>
      <div class="bellogue-write-actions">
        <button id="bellogue-write-submit" class="bellogue-btn-primary" type="button">${editingPost ? '수정 완료' : '등록'}</button>
      </div>
    </div>
  `;

  scroll.querySelector('#bellogue-write-back').addEventListener('click', () => { dialog._mobileSub = 'feed'; showTab(dialog, 'blog'); });

  function openImagePicker() {
    scroll.querySelector('#bellogue-write-image-input').click();
  }
  const imgBtn = scroll.querySelector('#bellogue-write-image-btn');
  if (imgBtn) imgBtn.addEventListener('click', openImagePicker);
  const thumbEl = scroll.querySelector('#bellogue-write-thumb');
  if (thumbEl) thumbEl.addEventListener('click', openImagePicker);

  scroll.querySelector('#bellogue-write-image-input').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    if (!dialog.open) dialog.showModal();
    const curTitle = scroll.querySelector('#bellogue-write-title').value;
    const curBody = scroll.querySelector('#bellogue-write-body').value;
    const reader = new FileReader();
    reader.onload = () => showImageCropper(dialog, reader.result, 300, 200, 640, 420,
      (dataUrl) => showWrite(dialog, editingId, { title: curTitle, body: curBody, image: dataUrl }),
      () => showWrite(dialog, editingId, { title: curTitle, body: curBody, image: pendingImage })
    );
    reader.readAsDataURL(file);
  });

  scroll.querySelector('#bellogue-write-submit').addEventListener('click', function () {
    const title = scroll.querySelector('#bellogue-write-title').value.trim();
    const body = scroll.querySelector('#bellogue-write-body').value.trim();
    if (!title || !body) { alert('제목과 내용을 모두 입력해주세요.'); return; }

    const s2 = getSettings();
    if (editingPost) {
      editingPost.title = title;
      editingPost.body = body;
      if (pendingImage) editingPost.image = pendingImage;
    } else {
      s2.posts.unshift({
        id: 'post_' + Date.now(),
        title, body,
        image: pendingImage,
        date: new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
        comments: [],
      });
    }
    saveSettingsDebounced();
    dialog._mobileSub = 'feed';
    showTab(dialog, 'blog');
  });
}

// ── 이웃 벨로그 ──────────────────────────────────────────────
function neighborTabHtml(dialog) {
  ensureNeighborSeeded();
  const s = getSettings();
  const view = dialog._neighborView;
  if (view) {
    const neighbor = s.neighbors.find(n => n.id === view.id);
    if (neighbor) return neighborVisitHtml(neighbor, view.postId);
  }
  return neighborListHtml(dialog, s.neighbors);
}

function neighborListHtml(dialog, neighbors) {
  const sub = dialog._neighborMobileSub || 'friends';
  const s = getSettings();
  const discoverList = s.discoverPool.filter(d => !neighbors.find(n => n.id === d.id));
  const manage = !!dialog._neighborManageMode;

  const friendRows = neighbors.map(n => `
    <div class="bellogue-neighbor-row" data-id="${n.id}">
      <div class="bellogue-neighbor-emoji">${n.emoji || '🌙'}</div>
      <div class="bellogue-row-main">
        <p class="bellogue-post-title">${escapeHtml(n.name)}</p>
        <span class="bellogue-meta">${escapeHtml(n.job)} · ${escapeHtml(n.district)}</span>
      </div>
      ${manage
        ? `<span class="bellogue-post-delete bellogue-remove-friend-btn" data-id="${n.id}">삭제</span>`
        : `<span class="bellogue-friend-badge">✓ 이웃</span>`}
    </div>
  `).join('') || `<p class="bellogue-placeholder-sm">아직 이웃이 없어요</p>`;

  const feedRows = s.neighborFeed.map(ref => {
    const n = neighbors.find(x => x.id === ref.neighborId);
    if (!n) return '';
    const p = n.posts.find(x => x.id === ref.postId);
    if (!p) return '';
    return `
      <div class="bellogue-neighbor-row" data-feed-neighbor="${n.id}" data-feed-post="${p.id}">
        <div class="bellogue-neighbor-emoji">${n.emoji || '🌙'}</div>
        <div class="bellogue-row-main">
          <p class="bellogue-post-title">${escapeHtml(n.name)} · ${escapeHtml(p.title)}</p>
          <span class="bellogue-meta">${escapeHtml(p.date)}</span>
        </div>
      </div>`;
  }).join('') || `<p class="bellogue-placeholder-sm">새 글 보기를 눌러보세요</p>`;

  const discoverRows = discoverList.map(n => `
    <div class="bellogue-neighbor-row">
      <div class="bellogue-neighbor-emoji">${n.emoji || '🌙'}</div>
      <div class="bellogue-row-main">
        <p class="bellogue-post-title">${escapeHtml(n.name)}</p>
        <span class="bellogue-meta">${escapeHtml(n.job)} · ${escapeHtml(n.district)}</span>
      </div>
      <span class="bellogue-add-friend-btn" data-id="${n.id}">+ 이웃맺기</span>
    </div>
  `).join('') || `<p class="bellogue-placeholder-sm">더 이상 추천할 이웃이 없어요</p>`;

  return `
    <div class="bellogue-mobile-subtabs">
      <span data-sub="friends" class="${sub === 'friends' ? 'active' : ''}">내 이웃</span>
      <span data-sub="discover" class="${sub === 'discover' ? 'active' : ''}">발견</span>
    </div>
    <div class="bellogue-page bellogue-profile-page${sub === 'friends' ? ' bellogue-mobile-active' : ''}">
      <div class="bellogue-feed-header" style="justify-content:space-between;">
        <span class="bellogue-section-tag" style="margin:0;">🏘 내 이웃</span>
        <span id="bellogue-neighbor-manage-btn" class="bellogue-icon-btn" title="이웃 관리"><i class="fa-solid fa-gear"></i></span>
      </div>
      <div class="bellogue-post-list">${friendRows}</div>

      <div class="bellogue-feed-header" style="margin-top:22px; justify-content:space-between;">
        <span class="bellogue-section-tag" style="margin:0;">📰 이웃 새 글</span>
        <span id="bellogue-neighbor-refresh" class="bellogue-refresh-btn" title="새 글 보기"><i class="fa-solid fa-rotate"></i></span>
      </div>
      <div class="bellogue-post-list" id="bellogue-neighbor-feed-list">${feedRows}</div>
    </div>
    <div class="bellogue-page bellogue-feed-page${sub === 'discover' ? ' bellogue-mobile-active' : ''}">
      <div class="bellogue-feed-header" style="justify-content:space-between;">
        <span class="bellogue-section-tag bellogue-section-tag-alt" style="margin:0;">✨ 발견</span>
        <span id="bellogue-discover-refresh" class="bellogue-refresh-btn" title="새로고침"><i class="fa-solid fa-rotate"></i></span>
      </div>
      <div class="bellogue-post-list">${discoverRows}</div>
    </div>
  `;
}

function neighborVisitHtml(neighbor, postId) {
  const post = (postId && neighbor.posts.find(p => p.id === postId)) || neighbor.posts[0];
  const bodyHtml = (post ? post.body : '').split(/\n+/).map(p => p.trim()).filter(Boolean)
    .map((p, i) => `<p class="bellogue-post-para${i === 0 ? ' bellogue-dropcap' : ''}">${escapeHtml(p)}</p>`).join('');
  const img = post && post.image ? `<div class="bellogue-post-image" style="background-image:url('${post.image}')"></div>` : '';
  const commentsList = (post && post.comments || []).map(c => `
    <div class="bellogue-comment-row${c.replyTo ? ' bellogue-comment-reply' : ''}"><p>${c.replyTo ? '<i class="fa-solid fa-reply" style="font-size:9px;color:var(--bn-muted);margin-right:4px;"></i>' : ''}<span class="bellogue-comment-name">${escapeHtml(c.name)}</span> ${escapeHtml(c.text)}</p></div>`).join('');

  return `
    <div class="bellogue-post">
      <p id="bellogue-neighbor-back" class="bellogue-back-link"><i class="fa-solid fa-arrow-left"></i> 이웃 목록으로</p>
      <div class="bellogue-neighbor-head">
        <div class="bellogue-neighbor-avatar">${neighbor.emoji || '🌙'}</div>
        <div>
          <p class="bellogue-name" style="margin:0;">${escapeHtml(neighbor.name)}</p>
          <p class="bellogue-post-subtitle" style="margin:2px 0 0;">${escapeHtml(neighbor.job)} · ${escapeHtml(neighbor.district)}</p>
        </div>
        <span class="bellogue-friend-badge">✓ 이웃</span>
      </div>
      <div class="bellogue-info-grid" style="margin:14px 0;">
        ${neighbor.birthday ? `<span>🎂 ${escapeHtml(neighbor.birthday)}</span>` : ''}
        ${neighbor.zodiac ? `<span>✨ ${escapeHtml(neighbor.zodiac)}</span>` : ''}
      </div>
      ${neighbor.intro ? `<p class="bellogue-intro">"${escapeHtml(neighbor.intro)}"</p>` : ''}

      ${post ? `
      <div class="bellogue-post-headrow" style="margin-top:22px;">
        <span class="bellogue-meta-badge">${escapeHtml(post.date)}</span>
      </div>
      <p class="bellogue-post-title-lg">${escapeHtml(post.title)}</p>
      ${img}
      <div class="bellogue-post-body">${bodyHtml}</div>
      <div class="bellogue-comments-box">
        <div class="bellogue-section-tag">💬 댓글 ${(post.comments || []).length}</div>
        ${commentsList}
        <div class="bellogue-comment-form">
          <input type="text" id="bellogue-neighbor-comment-input" class="bellogue-comment-input" placeholder="댓글을 남겨보세요">
          <button id="bellogue-neighbor-comment-submit" class="bellogue-btn-primary" type="button">등록</button>
        </div>
      </div>` : ''}
    </div>
  `;
}

// 유저가 이웃 글에 댓글을 달면, 그 이웃이 짧게 답글을 다는 AI 함수
async function generateNeighborReply(neighbor, post, userComment) {
  const s = getSettings();
  const langLine = s.language === 'en' ? 'Respond in English.' : '한국어로 답하세요.';
  const prompt = `${WORLD_GUARD}
당신은 1930년대풍 가상 도시 "벨 누아"에 사는 주민 "${neighbor.name}"입니다. 직업은 ${neighbor.job}입니다.
당신이 쓴 글 "${post.title}" (${post.body})에 누군가 이런 댓글을 남겼습니다: "${userComment}"
이 댓글에 짧게(1문장) 답글을 남기세요. 아래 JSON 형식으로만 답하세요. 다른 설명은 붙이지 마세요.
{"reply":"답글 내용"}
${ERA_RULE}
${langLine}`;
  try {
    const context = getContext();
    const raw = await context.generateQuietPrompt(prompt, false, false);
    const match = String(raw).match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no JSON in response');
    const data = JSON.parse(match[0]);
    if (!data.reply) throw new Error('empty reply');
    return { ok: true, reply: data.reply };
  } catch (e) {
    console.warn('[Bellogue] 이웃 답글 생성 실패:', e);
    return { ok: false };
  }
}

function wireNeighborEvents(dialog) {
  const scroll = dialog.querySelector('#bellogue-scroll');

  scroll.querySelectorAll('.bellogue-mobile-subtabs span').forEach(el => {
    el.addEventListener('click', function () {
      dialog._neighborMobileSub = this.dataset.sub;
      showTab(dialog, 'neighbor');
    });
  });

  scroll.querySelectorAll('.bellogue-neighbor-row[data-feed-neighbor]').forEach(row => {
    row.addEventListener('click', function () {
      dialog._neighborView = { id: this.dataset.feedNeighbor, postId: this.dataset.feedPost };
      showTab(dialog, 'neighbor');
    });
  });

  const refreshBtn = scroll.querySelector('#bellogue-neighbor-refresh');
  if (refreshBtn) refreshBtn.addEventListener('click', async function () {
    if (refreshBtn.dataset.loading === '1') return;
    refreshBtn.dataset.loading = '1';
    refreshBtn.classList.add('bellogue-spin');
    const result = await generateNeighborFeedPost();
    if (!result.ok) {
      refreshBtn.classList.remove('bellogue-spin');
      refreshBtn.dataset.loading = '0';
      alert('새 글을 불러오지 못했어요. 연결 프로필을 확인해주세요.');
      return;
    }
    showTab(dialog, 'neighbor');
  });

  const discoverRefreshBtn = scroll.querySelector('#bellogue-discover-refresh');
  if (discoverRefreshBtn) discoverRefreshBtn.addEventListener('click', async function () {
    if (discoverRefreshBtn.dataset.loading === '1') return;
    discoverRefreshBtn.dataset.loading = '1';
    discoverRefreshBtn.classList.add('bellogue-spin');
    const result = await generateDiscoverNeighbor();
    if (!result.ok) {
      discoverRefreshBtn.classList.remove('bellogue-spin');
      discoverRefreshBtn.dataset.loading = '0';
      alert('새 이웃을 불러오지 못했어요. 연결 프로필을 확인해주세요.');
      return;
    }
    showTab(dialog, 'neighbor');
  });

  const manageBtn = scroll.querySelector('#bellogue-neighbor-manage-btn');
  if (manageBtn) manageBtn.addEventListener('click', function () {
    dialog._neighborManageMode = !dialog._neighborManageMode;
    showTab(dialog, 'neighbor');
  });

  scroll.querySelectorAll('.bellogue-neighbor-row[data-id]').forEach(row => {
    row.addEventListener('click', function (e) {
      if (e.target.closest('.bellogue-add-friend-btn') || e.target.closest('.bellogue-remove-friend-btn')) return;
      dialog._neighborView = { id: this.dataset.id };
      showTab(dialog, 'neighbor');
    });
  });

  scroll.querySelectorAll('.bellogue-remove-friend-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!confirm('이 이웃을 삭제할까요?')) return;
      const s = getSettings();
      s.neighbors = s.neighbors.filter(n => n.id !== this.dataset.id);
      s.neighborFeed = s.neighborFeed.filter(ref => ref.neighborId !== this.dataset.id);
      saveSettingsDebounced();
      showTab(dialog, 'neighbor');
    });
  });

  scroll.querySelectorAll('.bellogue-add-friend-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const s = getSettings();
      const npc = s.discoverPool.find(n => n.id === this.dataset.id);
      if (!npc) return;
      if (!s.neighbors.find(n => n.id === npc.id)) {
        s.neighbors.push(JSON.parse(JSON.stringify(npc)));
        saveSettingsDebounced();
      }
      showTab(dialog, 'neighbor');
    });
  });

  const backEl = scroll.querySelector('#bellogue-neighbor-back');
  if (backEl) backEl.addEventListener('click', () => { dialog._neighborView = null; showTab(dialog, 'neighbor'); });

  const submitBtn = scroll.querySelector('#bellogue-neighbor-comment-submit');
  if (submitBtn) submitBtn.addEventListener('click', async function () {
    const input = scroll.querySelector('#bellogue-neighbor-comment-input');
    const text = input.value.trim();
    if (!text) return;
    if (submitBtn.dataset.loading === '1') return;

    const s = getSettings();
    const view = dialog._neighborView;
    const neighbor = s.neighbors.find(n => n.id === view.id);
    const post = (view.postId && neighbor.posts.find(p => p.id === view.postId)) || neighbor.posts[0];
    post.comments = post.comments || [];
    const userComment = { id: 'c_' + Date.now(), name: s.nickname || '나', text };
    post.comments.push(userComment);
    saveSettingsDebounced();

    submitBtn.dataset.loading = '1';
    submitBtn.innerHTML = '<i class="fa-solid fa-rotate bellogue-spin"></i>';
    submitBtn.disabled = true;
    const result = await generateNeighborReply(neighbor, post, text);
    if (result.ok) {
      const s2 = getSettings();
      const n2 = s2.neighbors.find(n => n.id === neighbor.id);
      const p2 = n2.posts.find(p => p.id === post.id);
      p2.comments.push({ id: 'c_' + Date.now() + '_r', name: neighbor.name, text: result.reply, replyTo: userComment.id });
      saveSettingsDebounced();
    }
    showTab(dialog, 'neighbor');
  });
}


// (이전에는 최근 채팅 내용을 프롬프트에 그대로 끼워넣었지만, 21세기적 내용이 새어 들어오는
// 문제가 있어 제거했습니다. 대신 아래 WORLD_GUARD로 시대 일관성을 강하게 못박습니다.)

// 주민센터 "새 글 보기" — 지정한 게시판에 벨 누아 주민 아무나 한 명이 새 글을 올림
async function generateBoardPost(boardId) {
  const s = getSettings();
  const boardDef = BOARD_DEFS.find(b => b.id === boardId);
  const topics = BOARD_TOPIC_MAP[boardId] || [];
  const langLine = s.language === 'en' ? 'Respond in English.' : '한국어로 답하세요.';
  const avoidAuthor = s.lastBoardAuthor ? `직전 작성자("${s.lastBoardAuthor}")와는 다른 사람이어야 합니다.` : '';
  const nameRule = boardId === 'notice'
    ? '작성자는 "벨 누아 시청" 또는 그에 준하는 관리 기관 이름으로 하세요.'
    : `작성자 이름은 반드시 서구풍 1930년대 분위기의 이름으로 지어주세요 (예: 레이븐, 모라, 실비아, 테오, 이든, 베티, 클라라, 안톤 같은 느낌). 현실적인 한국 이름이나 실존 인물, 유명인 이름은 절대 쓰지 마세요. ${avoidAuthor}`;
  const topicLine = topics.length ? `주제는 "${topics.join('/')}" 중 하나를 고르세요.` : '';

  const prompt = `${WORLD_GUARD}
1930년대풍 가상 도시 "벨 누아"의 "${boardDef.name}" 게시판에 올라올 법한 글 하나를 만들어주세요.
${nameRule}
${topicLine}
아래 JSON 형식으로만 답하세요. 다른 설명은 붙이지 마세요.
{"author":"작성자 이름","topic":"${topics.length ? topics.join('|') : '(없으면 빈 문자열)'}","title":"제목","body":"본문 (2~4문장)"}
${ERA_RULE}
${langLine}`;

  try {
    const context = getContext();
    const raw = await context.generateQuietPrompt(prompt, false, false);
    const match = String(raw).match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no JSON in response');
    const data = JSON.parse(match[0]);
    const post = {
      id: 'bp_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      boardId,
      author: data.author || '익명의 주민',
      topic: topics.includes(data.topic) ? data.topic : (topics[0] || ''),
      title: data.title || '오늘의 이야기',
      body: data.body || '별일 없이 지나간 하루였다.',
      date: todayStr(), comments: [],
    };
    const s2 = getSettings();
    s2.boardPosts.unshift(post);
    capBoardPosts(s2);
    s2.lastBoardAuthor = post.author;
    saveSettingsDebounced();
    return { ok: true };
  } catch (e) {
    console.warn('[Bellogue] 주민센터 새 글 생성 실패:', e);
    return { ok: false };
  }
}

// 게시판별로 최대 20개까지만 유지 (오래된 것부터 정리)
function capBoardPosts(s) {
  const kept = [];
  BOARD_DEFS.forEach(b => {
    const forBoard = s.boardPosts.filter(p => (p.boardId || 'free') === b.id).slice(0, 20);
    kept.push(...forBoard);
  });
  s.boardPosts = s.boardPosts.filter(p => kept.includes(p));
}

// 전체 새로고침 — 모든 게시판에 한 번씩 새 글을 생성
async function refreshAllBoards() {
  let anyOk = false;
  for (const b of BOARD_DEFS) {
    const result = await generateBoardPost(b.id);
    if (result.ok) anyOk = true;
  }
  return { ok: anyOk };
}

// 주민센터 글에 유저가 댓글을 달면, 작성자가 짧게 답글을 다는 AI 함수
async function generateBoardReply(post, userComment) {
  const s = getSettings();
  const langLine = s.language === 'en' ? 'Respond in English.' : '한국어로 답하세요.';
  const prompt = `${WORLD_GUARD}
당신은 1930년대풍 가상 도시 "벨 누아"의 주민 "${post.author}"입니다. 주민센터 게시판에 "${post.title}" (${post.body})라는 글을 올렸습니다.
누군가 이런 댓글을 남겼습니다: "${userComment}"
이 댓글에 짧게(1문장) 답글을 남기세요. 아래 JSON 형식으로만 답하세요. 다른 설명은 붙이지 마세요.
{"reply":"답글 내용"}
${ERA_RULE}
${langLine}`;
  try {
    const context = getContext();
    const raw = await context.generateQuietPrompt(prompt, false, false);
    const match = String(raw).match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no JSON in response');
    const data = JSON.parse(match[0]);
    if (!data.reply) throw new Error('empty reply');
    return { ok: true, reply: data.reply };
  } catch (e) {
    console.warn('[Bellogue] 주민센터 답글 생성 실패:', e);
    return { ok: false };
  }
}

// ── 주민센터 ─────────────────────────────────────────────────
function boardHtml(dialog) {
  const s = getSettings();
  const viewId = dialog._boardView;
  if (viewId) {
    const post = s.boardPosts.find(p => p.id === viewId);
    if (post) return boardPostDetailHtml(dialog, post);
  }
  if (dialog._boardWriteOpen) return boardWriteHtml(dialog);

  const showingSaved = !!dialog._boardShowSaved;
  const boardTab = dialog._boardTab || 'free';

  const topBar = `
    <div class="bellogue-feed-header" style="justify-content:space-between;">
      <span class="bellogue-section-tag" style="margin:0;">🏛 주민센터</span>
      <div style="display:flex;gap:8px;align-items:center;">
        <span id="bellogue-board-saved-toggle" class="bellogue-icon-btn" title="모아보기"><i class="${showingSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i></span>
        <span id="bellogue-board-refresh-all" class="bellogue-refresh-btn" title="전체 새로고침"><i class="fa-solid fa-rotate"></i></span>
      </div>
    </div>
  `;

  if (showingSaved) {
    const saved = s.boardPosts.filter(p => s.savedBoardPostIds.includes(p.id));
    const rows = saved.map(p => `
      <div class="bellogue-board-row" data-id="${p.id}">
        ${(p.boardId || 'free') === 'notice' ? `<span class="bellogue-stamp">관리자</span>` : (p.topic ? `<span class="bellogue-stamp">${escapeHtml(p.topic)}</span>` : '')}
        <span class="bellogue-row-title">${escapeHtml(p.title)}</span>
        <span class="bellogue-meta">${escapeHtml(p.author)} · ${escapeHtml(p.date)}</span>
      </div>
    `).join('') || `<p class="bellogue-placeholder">보관한 글이 없어요.</p>`;
    return `<div class="bellogue-board">${topBar}<div class="bellogue-board-list" style="margin-top:12px;">${rows}</div></div>`;
  }

  const navHtml = BOARD_DEFS.map(b =>
    `<a data-board="${b.id}" class="${b.id === boardTab ? 'active' : ''}">${b.name}</a>`
  ).join('');

  const canWrite = boardTab !== 'notice' && boardTab !== 'suggest';
  const boardPosts = s.boardPosts.filter(p => (p.boardId || 'free') === boardTab);
  const rows = boardPosts.map(p => `
    <div class="bellogue-board-row" data-id="${p.id}">
      ${boardTab === 'notice' ? `<span class="bellogue-stamp">관리자</span>` : (p.topic ? `<span class="bellogue-stamp">${escapeHtml(p.topic)}</span>` : '')}
      <span class="bellogue-row-title">${escapeHtml(p.title)}</span>
      <span class="bellogue-meta">${escapeHtml(p.author)} · ${escapeHtml(p.date)}</span>
    </div>
  `).join('') || `<p class="bellogue-placeholder">아직 올라온 글이 없어요.<br>우상단 새로고침을 눌러보세요.</p>`;

  return `
    <div class="bellogue-board">
      ${topBar}
      <nav class="bellogue-nav" style="margin:12px 0;">${navHtml}</nav>
      ${canWrite ? `
      <div class="bellogue-feed-header" style="justify-content:flex-end; margin-bottom:8px;">
        <span id="bellogue-board-write-btn" class="bellogue-write-btn"><i class="fa-solid fa-feather"></i> 글쓰기</span>
      </div>` : ''}
      <div class="bellogue-board-list">${rows}</div>
    </div>
  `;
}

function boardWriteHtml(dialog) {
  const boardTab = dialog._boardTab || 'free';
  const topics = BOARD_TOPIC_MAP[boardTab] || [];
  const topicOptions = topics.map(t => `<option value="${t}">${t}</option>`).join('');
  return `
    <div class="bellogue-write">
      <p id="bellogue-board-write-back" class="bellogue-back-link"><i class="fa-solid fa-arrow-left"></i> 뒤로</p>
      <p class="bellogue-settings-label" style="margin:0 0 14px;">${escapeHtml(BOARD_DEFS.find(b => b.id === boardTab).name)}에 글쓰기</p>
      ${topics.length ? `<select id="bellogue-board-write-topic" class="text_pole" style="margin-bottom:14px;">${topicOptions}</select>` : ''}
      <input id="bellogue-board-write-title" type="text" class="bellogue-write-title-input" placeholder="제목을 입력하세요">
      <textarea id="bellogue-board-write-body" class="bellogue-write-textarea" placeholder="내용을 입력하세요..."></textarea>
      <div class="bellogue-write-actions">
        <button id="bellogue-board-write-submit" class="bellogue-btn-primary" type="button">등록</button>
      </div>
    </div>
  `;
}

function boardPostDetailHtml(dialog, post) {
  const bodyHtml = post.body.split(/\n+/).map(p => p.trim()).filter(Boolean)
    .map(p => `<p class="bellogue-post-para">${escapeHtml(p)}</p>`).join('');
  const commentsList = (post.comments || []).map(c => `
    <div class="bellogue-comment-row${c.replyTo ? ' bellogue-comment-reply' : ''}"><p>${c.replyTo ? '<i class="fa-solid fa-reply" style="font-size:9px;color:var(--bn-muted);margin-right:4px;"></i>' : ''}<span class="bellogue-comment-name">${escapeHtml(c.name)}</span> ${escapeHtml(c.text)}</p></div>`).join('');
  const s = getSettings();
  const isSaved = s.savedBoardPostIds.includes(post.id);

  return `
    <div class="bellogue-post">
      <div class="bellogue-post-headrow">
        <p id="bellogue-board-back" class="bellogue-back-link" style="margin:0;"><i class="fa-solid fa-arrow-left"></i> 목록으로</p>
        <span id="bellogue-board-save-toggle" class="bellogue-icon-btn" title="보관"><i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i></span>
      </div>
      <div class="bellogue-post-headrow" style="margin-top:14px;">
        ${post.boardId === 'notice' ? `<span class="bellogue-meta-badge">관리자</span>` : (post.topic ? `<span class="bellogue-meta-badge">${escapeHtml(post.topic)}</span>` : '')}
      </div>
      <p class="bellogue-post-title-lg">${escapeHtml(post.title)}</p>
      <p class="bellogue-post-subtitle">${escapeHtml(post.author)} · ${escapeHtml(post.date)}</p>
      <div class="bellogue-post-body">${bodyHtml}</div>
      <div class="bellogue-comments-box">
        <div class="bellogue-section-tag">💬 댓글 ${(post.comments || []).length}</div>
        ${commentsList}
        <div class="bellogue-comment-form">
          <input type="text" id="bellogue-board-comment-input" class="bellogue-comment-input" placeholder="댓글을 남겨보세요">
          <button id="bellogue-board-comment-submit" class="bellogue-btn-primary" type="button">등록</button>
        </div>
      </div>
    </div>
  `;
}

function wireBoardEvents(dialog) {
  const scroll = dialog.querySelector('#bellogue-scroll');

  scroll.querySelectorAll('.bellogue-nav a[data-board]').forEach(a => {
    a.addEventListener('click', function () {
      dialog._boardTab = this.dataset.board;
      dialog._boardShowSaved = false;
      showTab(dialog, 'board');
    });
  });

  const savedToggle = scroll.querySelector('#bellogue-board-saved-toggle');
  if (savedToggle) savedToggle.addEventListener('click', function () {
    dialog._boardShowSaved = !dialog._boardShowSaved;
    showTab(dialog, 'board');
  });

  const refreshAllBtn = scroll.querySelector('#bellogue-board-refresh-all');
  if (refreshAllBtn) refreshAllBtn.addEventListener('click', async function () {
    if (refreshAllBtn.dataset.loading === '1') return;
    refreshAllBtn.dataset.loading = '1';
    refreshAllBtn.classList.add('bellogue-spin');
    const result = await refreshAllBoards();
    refreshAllBtn.classList.remove('bellogue-spin');
    refreshAllBtn.dataset.loading = '0';
    if (!result.ok) {
      alert('새 글을 불러오지 못했어요. 연결 프로필을 확인해주세요.');
      return;
    }
    showTab(dialog, 'board');
  });

  const writeBtn = scroll.querySelector('#bellogue-board-write-btn');
  if (writeBtn) writeBtn.addEventListener('click', function () {
    dialog._boardWriteOpen = true;
    showTab(dialog, 'board');
  });
  const writeBack = scroll.querySelector('#bellogue-board-write-back');
  if (writeBack) writeBack.addEventListener('click', function () {
    dialog._boardWriteOpen = false;
    showTab(dialog, 'board');
  });
  const writeSubmit = scroll.querySelector('#bellogue-board-write-submit');
  if (writeSubmit) writeSubmit.addEventListener('click', function () {
    const title = scroll.querySelector('#bellogue-board-write-title').value.trim();
    const body = scroll.querySelector('#bellogue-board-write-body').value.trim();
    if (!title || !body) { alert('제목과 내용을 모두 입력해주세요.'); return; }
    const topicEl = scroll.querySelector('#bellogue-board-write-topic');
    const s = getSettings();
    s.boardPosts.unshift({
      id: 'bp_' + Date.now(),
      boardId: dialog._boardTab || 'free',
      author: s.nickname || '나',
      topic: topicEl ? topicEl.value : '',
      title, body, date: todayStr(), comments: [],
    });
    capBoardPosts(s);
    saveSettingsDebounced();
    dialog._boardWriteOpen = false;
    showTab(dialog, 'board');
  });

  scroll.querySelectorAll('.bellogue-board-row').forEach(row => {
    row.addEventListener('click', function () {
      dialog._boardView = this.dataset.id;
      showTab(dialog, 'board');
    });
  });

  const backEl = scroll.querySelector('#bellogue-board-back');
  if (backEl) backEl.addEventListener('click', () => { dialog._boardView = null; showTab(dialog, 'board'); });

  const saveToggle = scroll.querySelector('#bellogue-board-save-toggle');
  if (saveToggle) saveToggle.addEventListener('click', function () {
    const s = getSettings();
    const id = dialog._boardView;
    if (s.savedBoardPostIds.includes(id)) {
      s.savedBoardPostIds = s.savedBoardPostIds.filter(x => x !== id);
    } else {
      s.savedBoardPostIds.push(id);
    }
    saveSettingsDebounced();
    showTab(dialog, 'board');
  });

  const submitBtn = scroll.querySelector('#bellogue-board-comment-submit');
  if (submitBtn) submitBtn.addEventListener('click', async function () {
    const input = scroll.querySelector('#bellogue-board-comment-input');
    const text = input.value.trim();
    if (!text) return;
    if (submitBtn.dataset.loading === '1') return;

    const s = getSettings();
    const post = s.boardPosts.find(p => p.id === dialog._boardView);
    post.comments = post.comments || [];
    const userComment = { id: 'c_' + Date.now(), name: s.nickname || '나', text };
    post.comments.push(userComment);
    saveSettingsDebounced();

    submitBtn.dataset.loading = '1';
    submitBtn.innerHTML = '<i class="fa-solid fa-rotate bellogue-spin"></i>';
    submitBtn.disabled = true;
    const result = await generateBoardReply(post, text);
    if (result.ok) {
      const s2 = getSettings();
      const p2 = s2.boardPosts.find(p => p.id === post.id);
      p2.comments.push({ id: 'c_' + Date.now() + '_r', name: post.author, text: result.reply, replyTo: userComment.id });
      saveSettingsDebounced();
    }
    showTab(dialog, 'board');
  });
}
