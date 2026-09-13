// Bellogue — 개인 다이어리 확장프로그램 (마법봉 메뉴 + 모달 + 설정 패널)

import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "bellogue";

const defaultSettings = {
  nickname: "",             // 일기/방명록에 쓸 내 필명
  colorTheme: "burgundy",    // burgundy / slate / sage / rose
  language: "ko",            // 출력 언어: ko / en
  connectionProfile: "",     // 생성에 쓸 연결 프로필 (빈 값 = 메인 프로필 사용)
};

function getSettings() {
  if (!extension_settings[extensionName]) {
    extension_settings[extensionName] = {};
  }
  const s = extension_settings[extensionName];
  for (const key in defaultSettings) {
    if (s[key] === undefined) s[key] = defaultSettings[key];
  }
  return s;
}

function applyColorTheme(theme) {
  document.documentElement.setAttribute('data-bellogue-theme', theme);
}

// ST의 연결 프로필 드롭다운(#connection_profiles)에서 그대로 목록을 읽어옴
// (FM 42.9 / 단어장 확장프로그램과 동일한 방식)
function getConnectionProfiles() {
  const profiles = [{ value: '', label: '메인 프로필 사용 (기본)' }];
  $('#connection_profiles option').each(function () {
    const val = $(this).val();
    const text = $(this).text().trim();
    if (val && text && text !== '<None>') profiles.push({ value: val, label: text });
  });
  return profiles;
}

jQuery(async () => {
  const settings = getSettings();
  applyColorTheme(settings.colorTheme);

  // 마법봉 메뉴 버튼
  const buttonHtml = `
    <div id="bellogue-menu-button" class="list-group-item flex-container flexGap5">
        <div class="fa-solid fa-book extensionsMenuExtensionButton"></div>
        <span>Bellogue</span>
    </div>`;
  $('#extensionsMenu').append(buttonHtml);
  $('#bellogue-menu-button').on('click', openBellogueModal);

  // 확장프로그램 관리 탭 — 설정 패널
  const profileOptions = getConnectionProfiles()
    .map(p => `<option value="${p.value}">${p.label}</option>`)
    .join('');

  const settingsHtml = `
    <div id="bellogue-settings">
      <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
          <b>Bellogue</b>
          <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content">

          <label for="bellogue-nickname">내 필명 (일기/방명록에 표시)</label>
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
            <label>
              <input type="radio" name="bellogue-language" value="ko">
              <span>🇰🇷 한국어</span>
            </label>
            <label>
              <input type="radio" name="bellogue-language" value="en">
              <span>🇺🇸 English</span>
            </label>
          </div>

          <label for="bellogue-connection-profile">연결 프로필</label>
          <select id="bellogue-connection-profile" class="text_pole">${profileOptions}</select>

        </div>
      </div>
    </div>
  `;
  $('#extensions_settings2').append(settingsHtml);

  // 저장된 값으로 UI 초기화
  $('#bellogue-nickname').val(settings.nickname);
  $('#bellogue-color-theme').val(settings.colorTheme);
  $(`input[name="bellogue-language"][value="${settings.language}"]`).prop('checked', true);
  $('#bellogue-connection-profile').val(settings.connectionProfile);

  // 값 바뀌면 저장
  $('#bellogue-nickname').on('input', function () {
    settings.nickname = $(this).val();
    saveSettingsDebounced();
  });
  $('#bellogue-color-theme').on('change', function () {
    settings.colorTheme = $(this).val();
    applyColorTheme(settings.colorTheme);
    saveSettingsDebounced();
  });
  $('input[name="bellogue-language"]').on('change', function () {
    settings.language = $(this).val();
    saveSettingsDebounced();
  });
  $('#bellogue-connection-profile').on('change', function () {
    settings.connectionProfile = $(this).val();
    saveSettingsDebounced();
  });
});

function openBellogueModal() {
  if (document.getElementById('bellogue-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'bellogue-overlay';
  overlay.innerHTML = `
    <div id="bellogue-modal">

      <div id="bellogue-page-left" class="bellogue-page">
        <div class="bellogue-page-header">
          <span class="bellogue-title">Bellogue</span>
          <i id="bellogue-close" class="fa-solid fa-xmark"></i>
        </div>
        <div class="bellogue-page-body" id="bellogue-content-diary">
          <p class="bellogue-placeholder">일기 페이지 (준비 중)</p>
        </div>
      </div>

      <div class="bellogue-spine">
        <span></span><span></span><span></span>
      </div>

      <div id="bellogue-page-right" class="bellogue-page">
        <div class="bellogue-page-body" id="bellogue-content-guestbook">
          <p class="bellogue-placeholder">방명록 페이지 (준비 중)</p>
        </div>
        <div class="bellogue-tab bellogue-tab-guestbook" data-tab="guestbook">방명록</div>
        <div class="bellogue-tab bellogue-tab-diary" data-tab="diary">일기</div>
      </div>

    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeBellogueModal();
  });
  document.getElementById('bellogue-close').addEventListener('click', closeBellogueModal);

  overlay.querySelectorAll('.bellogue-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      showBellogueTab(tab.getAttribute('data-tab'));
    });
  });

  showBellogueTab('diary');
}

function showBellogueTab(name) {
  const overlay = document.getElementById('bellogue-overlay');
  if (!overlay) return;

  overlay.querySelectorAll('.bellogue-tab').forEach(function (t) {
    t.classList.toggle('active', t.dataset.tab === name);
  });

  if (window.innerWidth <= 480) {
    document.getElementById('bellogue-page-left').style.display = name === 'diary' ? 'flex' : 'none';
    document.getElementById('bellogue-page-right').style.display = name === 'guestbook' ? 'flex' : 'none';
  }
}

function closeBellogueModal() {
  const overlay = document.getElementById('bellogue-overlay');
  if (overlay) overlay.remove();
}
