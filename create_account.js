document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('register-form');
  const errorBox = document.getElementById('error-message');
  const backBtn = document.getElementById('back-to-login');

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
  }
  function hideError() {
    errorBox.classList.add('hidden');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideError();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!fullName || !email || !password) {
      showError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      showError('Access key must be at least 6 characters.');
      return;
    }

    const btn = document.getElementById('register-btn');
    btn.disabled = true;
    btn.style.opacity = '0.7';

    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || 'Volunteer';

    fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
      })
    })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred during registration.');
      }
      
      // Store pending registration details so verify screen knows the email
      localStorage.setItem('apex_pending_registration', JSON.stringify({ email: email, fullName: fullName }));
      
      window.location.href = 'verify_identity_otp.html';
    })
    .catch((error) => {
      showError(error.message);
      btn.disabled = false;
      btn.style.opacity = '1';
    });
  });

  backBtn.addEventListener('click', function () {
    window.location.href = 'index.html';
  });
});
