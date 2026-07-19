document.addEventListener('DOMContentLoaded', function () {
  const inputs = Array.from(document.querySelectorAll('.otp-input'));
  const verifyBtn = document.getElementById('verify-btn');
  const message = document.getElementById('otp-message');
  const resendBtn = document.getElementById('resend-btn');
  const targetEmail = document.getElementById('target-email');
  const overlay = document.getElementById('success-overlay');

  const pending = ApexData.getPendingRegistration();
  if (pending && targetEmail) {
    targetEmail.textContent = pending.email;
  } else if (!pending) {
    // No pending registration - nothing to verify against. Send back to registration.
    if (message) {
      message.textContent = 'No pending registration found. Redirecting to create account...';
      message.classList.remove('hidden');
    }
    setTimeout(function () { window.location.href = 'create_account.html'; }, 1500);
  }

  function currentCode() {
    return inputs.map(i => i.value).join('');
  }
  function updateButtonState() {
    verifyBtn.disabled = currentCode().length !== inputs.length;
  }

  inputs.forEach(function (input, idx) {
    input.addEventListener('input', function () {
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
      if (input.value && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
      updateButtonState();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !input.value && idx > 0) {
        inputs[idx - 1].focus();
      }
    });
    input.addEventListener('paste', function (e) {
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
      if (text.length) {
        e.preventDefault();
        text.split('').slice(0, inputs.length).forEach(function (ch, i) {
          if (inputs[i]) inputs[i].value = ch;
        });
        updateButtonState();
        const next = inputs[Math.min(text.length, inputs.length - 1)];
        if (next) next.focus();
      }
    });
  });

  function showMessage(msg) {
    message.textContent = msg;
    message.classList.remove('hidden');
  }

  verifyBtn.addEventListener('click', function () {
    message.classList.add('hidden');
    const otp = currentCode();
    
    verifyBtn.disabled = true;
    verifyBtn.style.opacity = '0.7';

    fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: pending.email, otp: otp })
    })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Incorrect verification code.');
      }
      
      // Successful verification
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
      
      // Clear pending registration
      localStorage.removeItem('apex_pending_registration');
      
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
      setTimeout(function () {
        window.location.href = 'volunteer_profile.html';
      }, 1400);
    })
    .catch((error) => {
      showMessage(error.message);
      inputs.forEach(i => i.value = '');
      inputs[0].focus();
      verifyBtn.disabled = false;
      verifyBtn.style.opacity = '1';
      updateButtonState();
    });
  });

  resendBtn.addEventListener('click', function () {
    resendBtn.disabled = true;
    
    fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: pending.email })
    })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code.');
      }
      ApexData.toast('Verification code resent successfully.');
    })
    .catch((error) => {
      ApexData.toast(error.message);
    })
    .finally(() => {
      resendBtn.disabled = false;
    });
  });

  updateButtonState();
});
