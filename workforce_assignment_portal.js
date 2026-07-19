let __apexSelectedUser = null;
let __apexSelectedRole = 'Crowd Control';
let __apexSelectedLoc = 'Gate 7';

function selectUser(el) {
  document.querySelectorAll('.user-card').forEach(function (c) {
    c.classList.remove('border-primary', 'glow-active');
    c.classList.add('border-outline-variant');
    const check = c.querySelector('[data-icon="check_circle"]');
    if (check) check.remove();
  });
  el.classList.remove('border-outline-variant');
  el.classList.add('border-primary', 'glow-active');
  if (!el.querySelector('[data-icon="check_circle"]')) {
    const badge = document.createElement('div');
    badge.className = 'absolute top-0 right-0 p-2';
    badge.innerHTML = '<span class="material-symbols-outlined text-primary text-sm" data-icon="check_circle" style="font-variation-settings: \'FILL\' 1;">check_circle</span>';
    el.appendChild(badge);
  }
  const nameEl = el.querySelector('h3');
  __apexSelectedUser = nameEl ? nameEl.textContent.trim() : null;
  if (window.ApexData) ApexData.toast(__apexSelectedUser + ' selected for assignment.');
}

document.addEventListener('DOMContentLoaded', function () {
  // Role profile buttons
  document.querySelectorAll('[data-role-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-role-btn]').forEach(function (b) {
        b.classList.remove('bg-surface-container-highest', 'border-primary', 'text-primary');
        b.classList.add('bg-surface-container-high', 'border-outline-variant');
        const icon = b.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.add('group-hover:text-primary');
      });
      btn.classList.remove('bg-surface-container-high', 'border-outline-variant');
      btn.classList.add('bg-surface-container-highest', 'border-primary', 'text-primary');
      __apexSelectedRole = btn.getAttribute('data-role-btn');
    });
  });

  // Location buttons
  const locLabel = document.querySelector('p.text-\\[10px\\].font-label-caps.text-on-surface');
  document.querySelectorAll('[data-loc-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-loc-btn]').forEach(function (b) {
        b.classList.remove('bg-surface-container-highest', 'border-primary', 'text-primary');
        b.classList.add('bg-surface-container-high', 'border-outline-variant', 'text-on-surface-variant');
      });
      btn.classList.remove('bg-surface-container-high', 'border-outline-variant', 'text-on-surface-variant');
      btn.classList.add('bg-surface-container-highest', 'border-primary', 'text-primary');
      __apexSelectedLoc = btn.getAttribute('data-loc-btn');
      const locText = document.querySelector('[data-icon="location_on"] + p, .absolute.bottom-4.left-4 p');
      const badge = document.querySelector('.absolute.bottom-4.left-4 p');
      if (badge) badge.textContent = 'LOC: ' + __apexSelectedLoc.toUpperCase().replace(/\s+/g, '_');
    });
  });

  // Category filter chips
  document.querySelectorAll('[data-filter-chip]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('[data-filter-chip]').forEach(function (c) {
        c.classList.remove('bg-primary', 'text-on-primary');
        c.classList.add('bg-surface-container-high', 'text-on-surface-variant', 'border', 'border-outline-variant');
      });
      chip.classList.add('bg-primary', 'text-on-primary');
      chip.classList.remove('bg-surface-container-high', 'text-on-surface-variant', 'border', 'border-outline-variant');
      const filter = chip.getAttribute('data-filter-chip');
      document.querySelectorAll('.user-card').forEach(function (card) {
        const text = card.textContent.toLowerCase();
        const visible = filter === 'All Staff' || text.includes(filter.toLowerCase());
        card.style.display = visible ? '' : 'none';
      });
    });
  });

  // Search
  const search = document.getElementById('staff-search');
  if (search) {
    search.addEventListener('input', function () {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll('.user-card').forEach(function (card) {
        card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  // Confirm assignment
  const confirmBtn = document.getElementById('confirm-assignment-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      if (!__apexSelectedUser) {
        ApexData.toast('Select a staff member from the list first.');
        return;
      }
      ApexData.toast(__apexSelectedUser + ' assigned as ' + __apexSelectedRole + ' @ ' + __apexSelectedLoc + '.', 2800);
    });
  }
});
