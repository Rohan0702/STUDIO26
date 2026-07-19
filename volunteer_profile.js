let __apexShiftStartMs = null;

function toggle(btn) {
  const knob = btn.querySelector('div');
  const isOn = btn.classList.contains('bg-secondary-container');
  if (isOn) {
    btn.classList.remove('bg-secondary-container');
    btn.classList.add('bg-surface-container-highest');
    knob.classList.remove('translate-x-6');
    knob.classList.add('translate-x-0');
  } else {
    btn.classList.remove('bg-surface-container-highest');
    btn.classList.add('bg-secondary-container');
    knob.classList.remove('translate-x-0');
    knob.classList.add('translate-x-6');
  }
  const key = btn.getAttribute('data-setting');
  if (key && window.ApexData) {
    const settings = ApexData.getProfileSettings();
    settings[key] = !isOn;
    ApexData.setProfileSettings(settings);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const session = ApexData.getSession();

  // Restore saved toggle state
  const settings = ApexData.getProfileSettings();
  document.querySelectorAll('[data-setting]').forEach(function (btn) {
    const key = btn.getAttribute('data-setting');
    const shouldBeOn = !!settings[key];
    const isOn = btn.classList.contains('bg-secondary-container');
    if (shouldBeOn !== isOn) toggle(btn);
  });

  const translationSelect = document.getElementById('translation-select');
  if (translationSelect) {
    translationSelect.value = settings.translation || 'Spanish to English';
    translationSelect.addEventListener('change', function () {
      const s = ApexData.getProfileSettings();
      s.translation = translationSelect.value;
      ApexData.setProfileSettings(s);
      ApexData.toast('Primary translation set to ' + translationSelect.value + '.');
    });
  }

  // Live shift timer, persisted so it keeps counting across reloads.
  const timerEl = document.getElementById('timer');
  const STORAGE_KEY = 'apex_shift_start';
  __apexShiftStartMs = Number(localStorage.getItem(STORAGE_KEY));
  if (!__apexShiftStartMs) {
    // Preserve the mockup's original elapsed look (~4h21m) as the baseline.
    __apexShiftStartMs = Date.now() - (4 * 3600 + 21 * 60 + 18) * 1000;
    localStorage.setItem(STORAGE_KEY, String(__apexShiftStartMs));
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function renderTimer() {
    const elapsed = Math.max(0, Date.now() - __apexShiftStartMs);
    const totalSec = Math.floor(elapsed / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (timerEl) timerEl.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
  }
  renderTimer();
  setInterval(renderTimer, 1000);

  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.addEventListener('click', function () { window.location.href = 'volunteer_tasking_interface.html'; });

  const settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) settingsBtn.addEventListener('click', function () {
    document.querySelector('.md\\:col-span-2:has(#translation-select)')?.scrollIntoView({ behavior: 'smooth' });
    ApexData.toast('Scroll down for operations settings.');
  });

  const editBtn = document.getElementById('edit-profile-btn');
  if (editBtn) editBtn.addEventListener('click', function () {
    ApexData.toast('Profile editing is not available in this prototype.');
  });

  const dutyBtn = document.getElementById('duty-supervisor-btn');
  if (dutyBtn) dutyBtn.addEventListener('click', function () {
    ApexData.toast('Connecting you to the Duty Supervisor...', 3000);
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', function () {
    ApexData.logout();
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = 'sign_in.html';
  });
});
