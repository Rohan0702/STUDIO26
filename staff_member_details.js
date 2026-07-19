document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');
  const role = params.get('role');
  const id = params.get('id');
  const status = params.get('status');
  const zone = params.get('zone');

  if (name) {
    const nameEl = document.getElementById('detail-name');
    if (nameEl) nameEl.textContent = name;
    document.title = name + ' - STUDIO26 OPS';
  }
  if (id) {
    const idEl = document.getElementById('detail-id');
    if (idEl) idEl.textContent = id;
  }
  if (role) {
    const roleEl = document.getElementById('detail-role');
    if (roleEl) roleEl.textContent = role.charAt(0) + role.slice(1).toLowerCase();
  }
  if (zone) {
    const zoneEl = document.getElementById('detail-zone');
    if (zoneEl) zoneEl.textContent = zone;
    const postEl = document.getElementById('detail-post');
    if (postEl) postEl.textContent = zone;
  }
  if (status) {
    const statusEl = document.getElementById('detail-status');
    if (statusEl) {
      statusEl.textContent = status.toUpperCase() === 'ACTIVE' ? 'ACTIVE DEPLOYMENT' : status.toUpperCase();
      if (status.toUpperCase() !== 'ACTIVE') {
        statusEl.classList.remove('bg-secondary-container/20', 'text-secondary', 'border-secondary/30');
        statusEl.classList.add('bg-outline/10', 'text-outline', 'border-outline/30');
      }
    }
  }

  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.addEventListener('click', function () {
    window.location.href = 'staff_directory.html';
  });

  const commsBtn = document.getElementById('comms-btn');
  if (commsBtn) commsBtn.addEventListener('click', function () {
    ApexData.toast('Opening comms channel with ' + (name || 'this staff member') + '...');
  });

  const callBtn = document.getElementById('call-btn');
  if (callBtn) callBtn.addEventListener('click', function () {
    ApexData.toast('Placing a radio call to ' + (name || 'this staff member') + '...');
  });

  const editBtn = document.getElementById('edit-assignment-btn');
  if (editBtn) editBtn.addEventListener('click', function () {
    window.location.href = 'workforce_assignment_portal.html';
  });
});
