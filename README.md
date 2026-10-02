# Bubblecall — Zoom-like P2P Video Call App

A multi-page website for hosting and joining P2P video calls with account authentication.

## Features

- ✅ Account registration & login (Firebase Auth)
- ✅ Host a call — generates a 6-digit room code
- ✅ Join a call — no account needed, just enter code + username
- ✅ WebRTC P2P video/audio (host coordinates signaling)
- ✅ Multi-page structure (separate HTML files per page)
- ✅ Expandable settings page (profile, password, delete account)
- ✅ Responsive design
- ✅ Auth guards on protected pages

## Project Structure

```
Bubblecall/
├── index.html            Landing page
├── login.html            Login page
├── register.html         Registration page
├── dashboard.html        Post-login home (host/join options)
├── host.html             Create room / host setup
├── join.html             Enter code + username to join
├── call.html             WebRTC video call UI
├── settings.html         User settings (expandable)
├── css/
│   ├── common.css        Shared styles, variables, layout
│   ├── auth.css          Login/register form styles
│   ├── dashboard.css     Dashboard grid styles
│   ├── call.css          Call page styles
│   └── settings.css      Settings page styles
├── js/
│   ├── common.js         Shared utilities, auth state, nav
│   ├── auth.js           Login/register logic
│   ├── rooms.js          Room creation, code validation
│   ├── webrtc.js         WebRTC peer connection helpers
│   ├── call.js           Call page logic
│   └── settings.js       Settings logic
└── assets/               Icons, images
```

## Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"** → follow prompts
3. Enable:
   - **Authentication** → Sign-in method → Email/Password → Enable
   - **Firestore Database** → Create database (start in test mode for dev)
   - **Realtime Database** → Create database (start in test mode for dev)

### 2. Get Firebase Config

In Project Settings → Your apps → Web app, copy the config object.

### 3. Configure the App

Edit `js/common.js` and replace `FIREBASE_CONFIG` with your values:

```js
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages** in your repo
3. Source: **Deploy from a branch** → Branch: `main` → Folder: `/ (root)`
4. Save — your site will be at `https://<username>.github.io/<repo>/`

## How It Works

- **Host** creates a room → gets a 6-digit code → opens the call page
- **Joiner** enters code + username → joins the room
- WebRTC signaling goes through Firebase Realtime Database
- Media streams are P2P (direct browser-to-browser via STUN)
- The host coordinates the connection but does NOT relay media

## Security Notes

- Firebase Auth hashes passwords server-side (not client-side)
- Room codes are 6-digit random numbers (100,000–999,999)
- Auth guard protects dashboard, host, join, call, and settings pages
- **Important:** Update Firestore/Realtime Database rules from test mode before deploying publicly

## Expandability

- **New settings section:** Add a `<section>` in `settings.html`, a CSS file in `css/`, a JS file in `js/`, and import it in `settings.js`
- **Group calls:** Extend `webrtc.js` to handle multiple peer connections
- **Screen sharing:** Add `getDisplayMedia()` in `call.js`
- **Chat:** Add a Firestore collection for messages
