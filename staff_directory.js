document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-detail-name]').forEach(function (card) {
    card.addEventListener('click', function () {
      const params = new URLSearchParams({
        name: card.getAttribute('data-detail-name') || '',
        role: card.getAttribute('data-detail-role') || '',
        id: card.getAttribute('data-detail-id') || '',
        status: card.getAttribute('data-detail-status') || '',
        zone: card.getAttribute('data-detail-zone') || '',
      });
      window.location.href = 'staff_member_details.html?' + params.toString();
    });
  });

  const search = document.getElementById('directory-search');
  if (search) {
    search.addEventListener('input', function () {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll('[data-detail-name]').forEach(function (card) {
        card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  document.querySelectorAll('[data-status-chip]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('[data-status-chip]').forEach(function (c) {
        c.classList.remove('bg-surface-container-highest', 'border-primary', 'text-primary');
        c.classList.add('bg-surface-container-low', 'border-outline-variant', 'text-on-surface-variant');
      });
      chip.classList.remove('bg-surface-container-low', 'border-outline-variant', 'text-on-surface-variant');
      chip.classList.add('bg-surface-container-highest', 'border-primary', 'text-primary');
      const status = chip.getAttribute('data-status-chip');
      document.querySelectorAll('[data-detail-name]').forEach(function (card) {
        const cardStatus = card.getAttribute('data-detail-status') || '';
        const visible = status === 'ALL' || cardStatus.toUpperCase() === status;
        card.style.display = visible ? '' : 'none';
      });
    });
  });

  const deployBtn = document.getElementById('deploy-new-btn');
  if (deployBtn) {
    deployBtn.addEventListener('click', function () {
      window.location.href = 'workforce_assignment_portal.html';
    });
  }
});
