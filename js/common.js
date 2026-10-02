/* === Common Utilities === */

// Firebase config — replace with your own from Firebase Console
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDD49nlENFPmd0ngm4YqFc1Q1KmsuiKgpY",                    // Retrieve this from your Web App settings
  authDomain: "bubblecall-94fb4.firebaseapp.com",
  projectId: "bubblecall-94fb4",
  storageBucket: "bubblecall-94fb4.appspot.com",
  messagingSenderId: "319291188245",         // This is your Firebase Project Number
  appId: "1:319291188245:web:cc156edfea8b3675651a1c"                       // Retrieve this from your Web App settings
};

// Initialize Firebase
firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database(); // For WebRTC signaling

// --- Auth State ---
function getCurrentUser() {
  return auth.currentUser;
}

function isLoggedIn() {
  return !!auth.currentUser;
}

// --- Navigation ---
function navigateTo(page) {
  window.location.href = page;
}

function logout() {
  auth.signOut().then(() => {
    navigateTo('index.html');
  }).catch(err => {
    showMessage('logout-msg', err.message, 'error');
  });
}

// --- Auth Guard ---
function requireAuth() {
  if (!isLoggedIn()) {
    navigateTo('login.html');
    return false;
  }
  return true;
}

// --- UI Helpers ---
function showMessage(elementId, text, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = text;
  el.className = 'message message-' + type;
  el.classList.remove('hidden');
}

function hideMessage(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.classList.add('hidden');
}

function showLoading(buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.disabled = true;
  btn.dataset.originalText = btn.textContent;
  btn.innerHTML = '<span class="spinner"></span>Loading...';
}

function hideLoading(buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.disabled = false;
  btn.textContent = btn.dataset.originalText || 'Submit';
}

// --- Generate 6-digit room code ---
function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- Update navbar based on auth state ---
function updateNavbar() {
  const userDiv = document.getElementById('user-info');
  const loginLink = document.getElementById('nav-login');
  const logoutLink = document.getElementById('nav-logout');
  const dashboardLink = document.getElementById('nav-dashboard');

  if (isLoggedIn()) {
    const user = auth.currentUser;
    if (userDiv) userDiv.textContent = user.email || 'User';
    if (loginLink) loginLink.classList.add('hidden');
    if (logoutLink) logoutLink.classList.remove('hidden');
    if (dashboardLink) dashboardLink.classList.remove('hidden');
  } else {
    if (userDiv) userDiv.textContent = '';
    if (loginLink) loginLink.classList.remove('hidden');
    if (logoutLink) logoutLink.classList.add('hidden');
    if (dashboardLink) dashboardLink.classList.add('hidden');
  }
}

// --- Initialize page ---
function initPage() {
  updateNavbar();
}

document.addEventListener('DOMContentLoaded', initPage);

/**
 * Global auth listener that centralises navigation logic.
 * This prevents the “login ↔ dashboard” bounce that occurs when each page
 * individually checks `auth.currentUser` before Firebase finishes restoring
 * the saved session.
 */
auth.onAuthStateChanged(user => {
  const path = window.location.pathname.toLowerCase();
  const isAuthPage = path.endsWith('login.html') || path.endsWith('register.html');
  const isProtected =
    path.endsWith('dashboard.html') ||
    path.endsWith('host.html') ||
    path.endsWith('call.html') ||
    path.endsWith('settings.html');

  if (user) {
    // User is signed in
    if (isAuthPage) {
      // If they are on login or register, send them to the dashboard
      navigateTo('dashboard.html');
    }
    // No action needed for protected pages – they stay where they are
  } else {
    // No user signed in
    if (isProtected) {
      // Guard protected pages – send to login
      navigateTo('login.html');
    }
    // Auth pages are fine to stay on
  }
});
