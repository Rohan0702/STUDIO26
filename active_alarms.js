document.addEventListener('DOMContentLoaded', function () {
  const backBtn = document.getElementById('back-btn');
  const filterBtn = document.getElementById('filter-btn');

  if (backBtn) backBtn.addEventListener('click', function () {
    window.location.href = 'workforce_assignment_portal.html';
  });
  if (filterBtn) filterBtn.addEventListener('click', function () {
    ApexData.toast('Filter by severity: All / Critical / Warning.');
  });

  function wireRespond(btnId, alarmId, label) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', function () {
      ApexData.updateAlarm(alarmId, { status: 'RESPONDING' });
      btn.disabled = true;
      btn.classList.add('opacity-50', 'cursor-not-allowed');
      btn.classList.remove('bg-primary', 'hover:opacity-90');
      btn.classList.add('bg-surface-variant', 'text-on-surface-variant');
      btn.innerHTML = '<span class="material-symbols-outlined text-sm">check_circle</span> ' + label;
      ApexData.toast('You are now responding to this alarm.');
    });
  }
  wireRespond('respond-a1', 'a1', 'RESPONDING');
  wireRespond('dispatch-a3', 'a3', 'SECURITY EN ROUTE');

  function wireViewMap(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.location.href = 'stadium_operations_map.html';
    });
  }
  wireViewMap('viewmap-a1');
  wireViewMap('viewmap-a2');

  const liveFeedBtn = document.getElementById('livefeed-a3');
  if (liveFeedBtn) liveFeedBtn.addEventListener('click', function () {
    ApexData.toast('Live camera feed is not wired to real hardware in this prototype.');
  });
});
