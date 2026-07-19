/* APEX OPS - shared navigation wiring.
   Works off data-nav / data-nav-toast attributes added to elements in each page.
   data-nav="some_page.html"   -> navigates there on click
   data-nav="back"             -> history.back() with fallback
   data-nav-toast="message"    -> shows a toast instead of navigating (feature not in this prototype)
*/
(function () {
  const PUBLIC_PAGES = ['sign_in.html', 'create_account.html', 'verify_identity_otp.html', ''];

  function currentPage() {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1] || 'sign_in.html';
  }

  document.addEventListener('DOMContentLoaded', function () {
    const page = currentPage();

    // Auth guard for everything except the public onboarding pages.
    if (window.ApexData && !PUBLIC_PAGES.includes(page)) {
      if (!ApexData.getSession()) {
        window.location.href = 'sign_in.html';
        return;
      }
    }

    // Wire nav elements
    document.querySelectorAll('[data-nav]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        const target = el.getAttribute('data-nav');
        if (target === 'back') {
          if (document.referrer && document.referrer.includes(window.location.host)) {
            history.back();
          } else {
            window.location.href = el.getAttribute('data-nav-fallback') || 'workforce_assignment_portal.html';
          }
          return;
        }
        window.location.href = target;
      });
      el.style.cursor = 'pointer';
    });

    document.querySelectorAll('[data-nav-toast]').forEach(function (el) {
      el.addEventListener('click', function () {
        if (window.ApexData) ApexData.toast(el.getAttribute('data-nav-toast'));
      });
      el.style.cursor = 'pointer';
    });

    // Highlight active bottom/side nav item that matches the current page, if tagged.
    document.querySelectorAll('[data-nav-current]').forEach(function (el) {
      el.classList.add('nav-active-marker');
    });

    // Populate any header/profile placeholders with the logged-in user's name.
    if (window.ApexData) {
      const session = ApexData.getSession();
      if (session) {
        document.querySelectorAll('[data-user-name]').forEach(function (el) {
          el.textContent = session.fullName || session.email;
        });
        document.querySelectorAll('[data-user-email]').forEach(function (el) {
          el.textContent = session.email;
        });
        document.querySelectorAll('[data-user-id]').forEach(function (el) {
          el.textContent = session.staffId || '—';
        });
      }
    }
  });
})();
