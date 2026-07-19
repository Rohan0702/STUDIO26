document.addEventListener('DOMContentLoaded', function () {
  const collapseBtn = document.getElementById('collapse-map-btn');
  const searchBtn = document.getElementById('map-search-btn');
  const layersBtn = document.getElementById('map-layers-btn');
  const locateBtn = document.getElementById('map-locate-btn');
  const dismissBtn = document.getElementById('dismiss-alert-btn');
  const deployBtn = document.getElementById('deploy-support-btn');

  if (collapseBtn) collapseBtn.addEventListener('click', function () {
    window.location.href = 'stadium_operations_map.html';
  });
  if (searchBtn) searchBtn.addEventListener('click', function () {
    ApexData.toast('Search zones, gates, and staff by name.');
  });
  if (layersBtn) layersBtn.addEventListener('click', function () {
    ApexData.toast('Layers: Density, Staffing, Incidents.');
  });
  if (locateBtn) locateBtn.addEventListener('click', function () {
    ApexData.toast('Centered on your current zone.');
  });
  if (dismissBtn) dismissBtn.addEventListener('click', function () {
    dismissBtn.closest('.fixed')?.remove();
  });
  if (deployBtn) deployBtn.addEventListener('click', function () {
    ApexData.updateZone('gate-7', { status: 'REINFORCING' });
    deployBtn.disabled = true;
    deployBtn.style.opacity = '0.6';
    deployBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check_circle</span> SUPPORT UNITS EN ROUTE';
    ApexData.toast('Support units dispatched to Gate 7.', 2600);
  });
});
