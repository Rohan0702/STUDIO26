document.addEventListener('DOMContentLoaded', function () {
  const filterBtn = document.getElementById('zone-filter-btn');
  const redeployBtn = document.getElementById('redeploy-staff-btn');
  const fullscreenBtn = document.getElementById('zone-fullscreen-btn');
  const emergencyFab = document.getElementById('emergency-fab');

  if (filterBtn) filterBtn.addEventListener('click', function () {
    ApexData.toast('Filter by status: Optimal / Understaffed / Critical.');
  });
  if (redeployBtn) redeployBtn.addEventListener('click', function () {
    window.location.href = 'workforce_assignment_portal.html';
  });
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', function () {
    window.location.href = 'stadium_operations_map_full_view.html';
  });
  if (emergencyFab) emergencyFab.addEventListener('click', function () {
    window.location.href = 'active_alarms.html';
  });

  document.querySelectorAll('[data-zone-id]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const zoneId = btn.getAttribute('data-zone-id');
      const action = btn.getAttribute('data-zone-action');
      if (action === 'edit') {
        window.location.href = 'workforce_assignment_portal.html';
        return;
      }
      if (action === 'reinforce') {
        ApexData.updateZone(zoneId, { status: 'REINFORCING' });
        ApexData.toast('Additional staff dispatched to reinforce this zone.');
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.textContent = 'REINFORCEMENTS EN ROUTE';
      }
      if (action === 'emergency') {
        ApexData.updateZone(zoneId, { status: 'EMERGENCY_DEPLOYED' });
        ApexData.toast('Emergency deployment triggered for Gate 7.', 2600);
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.textContent = 'UNITS DISPATCHED';
      }
    });
  });

  // Clicking a zone row (not a button) opens it on the live map.
  document.querySelectorAll('[data-zone-id]').forEach(function (btn) {
    const row = btn.closest('.group');
    if (row) {
      row.addEventListener('click', function () {
        window.location.href = 'stadium_operations_map.html';
      });
    }
  });
});
