document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('login-form');
  const errorBox = document.getElementById('error-message');
  const registerBtn = document.getElementById('register-btn');
  const toggleBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');

  // If already signed in, skip straight to the dashboard.
  if (ApexData.getSession()) {
    window.location.href = 'workforce_assignment_portal.html';
    return;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
  }
  function hideError() {
    errorBox.classList.add('hidden');
  }

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', function () {
      const isPw = passwordInput.type === 'password';
      passwordInput.type = isPw ? 'text' : 'password';
      const icon = toggleBtn.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = isPw ? 'visibility_off' : 'visibility';
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideError();
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Please enter your email and access key.');
      return;
    }

    const loginBtn = document.getElementById('login-btn');
    loginBtn.disabled = true;
    loginBtn.style.opacity = '0.7';

    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          // User is registered but not verified
          localStorage.setItem('apex_pending_registration', JSON.stringify({ email: email }));
          ApexData.toast(data.message || 'Account not verified. Redirecting to OTP verification...');
          setTimeout(function() {
            window.location.href = 'verify_identity_otp.html';
          }, 1500);
          return;
        }
        throw new Error(data.message || 'Invalid email or access key.');
      }
      
      const user = data.user;
      const fullName = (user.firstName + ' ' + user.lastName).trim();
      
      ApexData.setSession({
        email: user.email,
        fullName: fullName,
        staffId: user.staffId || 'AZ-' + Math.floor(10000 + Math.random() * 89999),
        role: user.role,
        avatar: user.avatar,
        loggedInAt: Date.now()
      });
      
      ApexData.toast('Authenticated. Welcome back, ' + user.firstName + '.');
      setTimeout(function () {
        window.location.href = 'workforce_assignment_portal.html';
      }, 1000);
    })
    .catch((error) => {
      showError(error.message);
      loginBtn.disabled = false;
      loginBtn.style.opacity = '1';
    });
  });

  registerBtn.addEventListener('click', function () {
    window.location.href = 'create_account.html';
  });
});
