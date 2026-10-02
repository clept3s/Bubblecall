/* === Settings Page Logic === */

// --- Update display name ---
function updateDisplayName() {
  hideMessage('settings-msg');
  const newName = document.getElementById('settings-name').value.trim();
  const btn = document.getElementById('settings-save-name-btn');

  if (!newName || newName.length > 20) {
    showMessage('settings-msg', 'Name must be 1-20 characters.', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Saving...';

  const user = auth.currentUser;
  if (!user) return;

  user.updateProfile({ displayName: newName }).then(() => {
    showMessage('settings-msg', 'Display name updated.', 'success');
    btn.disabled = false;
    btn.textContent = 'Save';
  }).catch((err) => {
    showMessage('settings-msg', err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Save';
  });
}

// --- Change password ---
function changePassword() {
  hideMessage('settings-msg');
  const currentPassword = document.getElementById('settings-current-password').value;
  const newPassword = document.getElementById('settings-new-password').value;
  const confirmPassword = document.getElementById('settings-confirm-password').value;
  const btn = document.getElementById('settings-change-password-btn');

  if (!currentPassword || !newPassword || !confirmPassword) {
    showMessage('settings-msg', 'All password fields are required.', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showMessage('settings-msg', 'New password must be at least 6 characters.', 'error');
    return;
  }

  if (newPassword !== confirmPassword) {
    showMessage('settings-msg', 'New passwords do not match.', 'error');
    return;
  }

  // Re-authenticate then change password
  const user = auth.currentUser;
  const credential = firebase.auth.EmailAuthProvider.credential(
    user.email, currentPassword
  );

  btn.disabled = true;
  btn.textContent = 'Changing...';

  user.reauthenticateWithCredential(credential).then(() => {
    return user.updatePassword(newPassword);
  }).then(() => {
    showMessage('settings-msg', 'Password changed successfully.', 'success');
    document.getElementById('settings-current-password').value = '';
    document.getElementById('settings-new-password').value = '';
    document.getElementById('settings-confirm-password').value = '';
    btn.disabled = false;
    btn.textContent = 'Change Password';
  }).catch((err) => {
    showMessage('settings-msg', err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Change Password';
  });
}

// --- Delete account ---
function deleteAccount() {
  if (!confirm('Are you sure? This cannot be undone.')) return;

  const user = auth.currentUser;
  if (!user) return;

  user.delete().then(() => {
    navigateTo('index.html');
  }).catch((err) => {
    showMessage('settings-msg', err.message, 'error');
  });
}

// --- Initialize settings page ---
function initSettingsPage() {
  // The global auth listener in common.js already handles redirection for
  // unauthenticated users, so we just initialise the UI when a user is
  // available. Using `auth.onAuthStateChanged` guarantees the user object is
  // ready even during the initial page load.
  const unsubscribe = auth.onAuthStateChanged(user => {
    if (!user) return; // If not logged in the global listener will have sent us to login.
    document.getElementById('settings-name').value = user.displayName || '';
    document.getElementById('settings-email').value = user.email || '';
    unsubscribe(); // stop listening after we have the data we need
  });
}
