/* === Authentication Logic === */

// --- Register ---
function handleRegister(event) {
  event.preventDefault();
  hideMessage('register-msg');

  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;
  const btn = document.getElementById('register-btn');

  // Validation
  if (!email || !password || !confirmPassword) {
    showMessage('register-msg', 'All fields are required.', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('register-msg', 'Password must be at least 6 characters.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showMessage('register-msg', 'Passwords do not match.', 'error');
    return;
  }

  showLoading('register-btn');

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      hideLoading('register-btn');
      showMessage('register-msg', 'Account created! Redirecting...', 'success');
      // Save display name if provided
      const displayName = document.getElementById('reg-name').value.trim();
      if (displayName) {
        userCredential.user.updateProfile({ displayName });
      }
      setTimeout(() => navigateTo('login.html'), 1500);
    })
    .catch((error) => {
      hideLoading('register-btn');
      showMessage('register-msg', error.message, 'error');
    });
}

// --- Login ---
function handleLogin(event) {
  event.preventDefault();
  hideMessage('login-msg');

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');

  if (!email || !password) {
    showMessage('login-msg', 'Email and password are required.', 'error');
    return;
  }

  showLoading('login-btn');

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      hideLoading('login-btn');
      navigateTo('dashboard.html');
    })
    .catch((error) => {
      hideLoading('login-btn');
      showMessage('login-msg', error.message, 'error');
    });
}

// --- Auto-redirect if already logged in ---
auth.onAuthStateChanged((user) => {
  // If on login/register page and already logged in, go to dashboard
  if (user && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
    navigateTo('dashboard.html');
  }
});
