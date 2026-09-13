// Bellogue — 개인 다이어리 확장프로그램 (최소 버전: 마법봉 메뉴 등록 + 모달만)

jQuery(async () => {
  const buttonHtml = `
    <div id="bellogue-menu-button" class="list-group-item flex-container flexGap5">
        <div class="fa-solid fa-book extensionsMenuExtensionButton"></div>
        <span>Bellogue</span>
    </div>`;
  $('#extensionsMenu').append(buttonHtml);
  $('#bellogue-menu-button').on('click', openBellogueModal);
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
