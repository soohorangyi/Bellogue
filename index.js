// Bellogue — 개인 다이어리 확장프로그램

import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "bellogue";

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
  renderIndexTabs(dialog, name);
  const scroll = dialog.querySelector('#bellogue-scroll');
  if (name === 'board') {
    scroll.innerHTML = boardHtml();
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
  const img = post.image ? `<div class="bellogue-post-image" style="background-image:url('${post.image}')"></div>` : '';
  const editDel = manageMode ? `
    <span class="bellogue-post-edit" data-id="${post.id}">수정</span>
    <span class="bellogue-post-delete" data-id="${post.id}">삭제</span>` : '';
  const comments = (post.comments || []).map(c => `
    <div class="bellogue-comment-row">
      <p><span class="bellogue-comment-name">${escapeHtml(c.name)}</span> ${escapeHtml(c.text)}</p>
      ${manageMode ? `<span class="bellogue-comment-delete" data-post="${post.id}" data-comment="${c.id}">삭제</span>` : ''}
    </div>`).join('');

  return `
    <div class="bellogue-post" data-id="${post.id}">
      <p id="bellogue-write-back" class="bellogue-back-link"><i class="fa-solid fa-arrow-left"></i> 목록으로</p>
      <div class="bellogue-post-head">
        <p class="bellogue-post-title">${escapeHtml(post.title)}</p>
        <div class="bellogue-post-head-right"><span class="bellogue-meta">${escapeHtml(post.date)}</span>${editDel}</div>
      </div>
      ${img}
      <p class="bellogue-post-body">${escapeHtml(post.body)}</p>
      ${comments}
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

// ── 주민센터 (준비 중) ───────────────────────────────────────
function boardHtml() {
  return `
    <div class="bellogue-board">
      <div class="bellogue-board-header">
        <button class="bellogue-write-btn">글쓰기</button>
      </div>
      <div class="bellogue-board-list">
        <p class="bellogue-placeholder">주민센터 (준비 중)</p>
      </div>
    </div>
  `;
}
