/* APEX OPS - shared client-side data layer.
   Everything here is a prototype persistence shim backed by localStorage.
   No real server. Safe to inspect in devtools under keys prefixed "apex_". */
(function (global) {
  const KEYS = {
    users: 'apex_users',
    session: 'apex_session',
    staff: 'apex_staff',
    zones: 'apex_zones',
    alarms: 'apex_alarms',
    tasks: 'apex_tasks',
    pendingReg: 'apex_pending_registration',
    profileSettings: 'apex_profile_settings',
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ---------- Seed data (only written once) ----------
  const SEED_STAFF = [
    { id: 'FIFA-2026-X884', name: 'Elena Rodriguez', role: 'Crowd Flow Specialist', dept: 'Security', zone: 'Zone 3 - North Gate', post: 'Gates 7-9 (South Ingress)', status: 'ACTIVE', clearance: 'Level 4' },
    { id: '44021', name: 'Elena Ramirez', role: 'Gate 7 Security', dept: 'Security', zone: 'Gate 7', post: 'Gate 7', status: 'ACTIVE', clearance: 'Level 2' },
    { id: '44089', name: 'Marcus Chen', role: 'Unassigned', dept: 'Security', zone: '—', post: '—', status: 'IDLE', clearance: 'Level 1' },
    { id: '44112', name: 'Derrick Okafor', role: 'Logistics Coordinator', dept: 'Logistics', zone: 'Zone 4', post: 'Loading Dock', status: 'ACTIVE', clearance: 'Level 2' },
    { id: '44156', name: 'Sarah Jenkins', role: 'Medical Lead', dept: 'Medical', zone: '—', post: 'Medical Bay', status: 'IDLE', clearance: 'Level 3' },
    { id: '392-C', name: 'Yuki Tanaka', role: 'Communications', dept: 'Volunteers', zone: 'Command Center', post: 'Comms Desk', status: 'ACTIVE', clearance: 'Level 2' },
    { id: 'AZ-30922', name: 'David Alvarez', role: 'Zone 3 Specialist', dept: 'Volunteers', zone: 'Zone 3', post: 'North Gateway 3A', status: 'ACTIVE', clearance: 'Level 1' },
  ];

  const SEED_ZONES = [
    { id: 'north-stand', name: 'North Stand', sub: 'Sectors N1 - N14', staffed: 142, capacity: 150, status: 'OPTIMAL' },
    { id: 'concourse-b', name: 'Concourse B', sub: 'Level 2 / East Wing', staffed: 84, capacity: 120, status: 'UNDERSTAFFED' },
    { id: 'gate-7', name: 'Gate 7 Entry', sub: 'Main Spectator Entrance', staffed: 12, capacity: 45, status: 'CRITICAL' },
    { id: 'south-stand', name: 'South Stand', sub: 'Sectors S1 - S12', staffed: 98, capacity: 100, status: 'OPTIMAL' },
  ];

  const SEED_ALARMS = [
    { id: 'a1', title: 'Gate 7: Ingress Surge', level: 'CRITICAL', location: 'Estadio Azteca | Zone 5', time: '14:22', desc: 'AI Detection: Ingress flow at Gate 7 exceeds capacity by 42%. Predicted backlog duration: 15 minutes.', status: 'OPEN' },
    { id: 'a2', title: 'Zone 3: Medical Emergency', level: 'WARNING', location: 'Estadio Azteca | Concourse B', time: '14:38', desc: 'Heat-related incident reported at refreshment stand 302. Volunteer Team 4 is on-site.', status: 'RESPONDING' },
    { id: 'a3', title: 'VIP North: Unmatched Credential', level: 'CRITICAL', location: 'Estadio Azteca | Level 2', time: '14:40', desc: 'Facial recognition mismatch at VIP entrance. Subject attempting entry with Level 3 pass in Level 1 restricted zone.', status: 'OPEN' },
  ];

  const SEED_TASKS = [
    { id: 't1', title: 'Assist Mateo (Accessibility Support)', desc: 'Mateo is rerouting to the accessible elevator near Gate 7 due to Gate 6 closure. Mateo speaks Spanish.', action: 'Direct to Elevator 4B. Use built-in translation to explain the detour.', priority: true, status: 'PENDING', eta: null },
    { id: 't2', title: 'Ingress Surge Alert', desc: 'Assist with queue management at Gate 7A.', action: 'Report to Gate 7A and coordinate lane splitting.', priority: false, status: 'QUEUED', eta: 'T-MINUS 15 MIN' },
    { id: 't3', title: 'Translation Request', desc: 'Fan needs help at Information Kiosk 2.', action: 'Head to Information Kiosk 2, 300m away.', priority: false, status: 'QUEUED', eta: '300m AWAY' },
  ];

  function seed() {
    if (!localStorage.getItem(KEYS.staff)) write(KEYS.staff, SEED_STAFF);
    if (!localStorage.getItem(KEYS.zones)) write(KEYS.zones, SEED_ZONES);
    if (!localStorage.getItem(KEYS.alarms)) write(KEYS.alarms, SEED_ALARMS);
    if (!localStorage.getItem(KEYS.tasks)) write(KEYS.tasks, SEED_TASKS);
  }
  seed();

  // ---------- Toast ----------
  function toast(message, ms) {
    let el = document.getElementById('apex-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'apex-toast';
      el.className = 'apex-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), ms || 2200);
  }

  // ---------- Auth ----------
  function getSession() { return read(KEYS.session, null); }
  function setSession(s) { write(KEYS.session, s); }
  function clearSession() { localStorage.removeItem(KEYS.session); }

  function logout() {
    clearSession();
  }

  function getPendingRegistration() { return read(KEYS.pendingReg, null); }

  function requireAuth(redirectTo) {
    if (!getSession()) {
      window.location.href = redirectTo || 'index.html';
      return false;
    }
    return true;
  }

  // ---------- Domain data ----------
  function getStaff() { return read(KEYS.staff, []); }
  function setStaff(s) { write(KEYS.staff, s); }
  function findStaff(id) { return getStaff().find(s => s.id === id); }
  function updateStaff(id, patch) {
    const list = getStaff();
    const idx = list.findIndex(s => s.id === id);
    if (idx > -1) { list[idx] = Object.assign({}, list[idx], patch); setStaff(list); }
    return list[idx];
  }

  function getZones() { return read(KEYS.zones, []); }
  function setZones(z) { write(KEYS.zones, z); }
  function updateZone(id, patch) {
    const list = getZones();
    const idx = list.findIndex(z => z.id === id);
    if (idx > -1) { list[idx] = Object.assign({}, list[idx], patch); setZones(list); }
    return list[idx];
  }

  function getAlarms() { return read(KEYS.alarms, []); }
  function setAlarms(a) { write(KEYS.alarms, a); }
  function updateAlarm(id, patch) {
    const list = getAlarms();
    const idx = list.findIndex(a => a.id === id);
    if (idx > -1) { list[idx] = Object.assign({}, list[idx], patch); setAlarms(list); }
    return list[idx];
  }

  function getTasks() { return read(KEYS.tasks, []); }
  function setTasks(t) { write(KEYS.tasks, t); }
  function updateTask(id, patch) {
    const list = getTasks();
    const idx = list.findIndex(t => t.id === id);
    if (idx > -1) { list[idx] = Object.assign({}, list[idx], patch); setTasks(list); }
    return list[idx];
  }

  function getProfileSettings() {
    return read(KEYS.profileSettings, { haptics: true, voiceAlerts: true, highNoise: false, translation: 'Spanish to English' });
  }
  function setProfileSettings(s) { write(KEYS.profileSettings, s); }

  global.ApexData = {
    KEYS, toast,
    getSession, setSession, clearSession,
    logout, getPendingRegistration, requireAuth,
    getStaff, setStaff, findStaff, updateStaff,
    getZones, setZones, updateZone,
    getAlarms, setAlarms, updateAlarm,
    getTasks, setTasks, updateTask,
    getProfileSettings, setProfileSettings,
  };
})(window);
