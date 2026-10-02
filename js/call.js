/* === Call Page Logic === */

let myUsername = '';
let myCode = '';
let amIHost = false;

async function startCallAsHost(code) {
  hideMessage('call-msg');

  myCode = code;
  amIHost = true;
  myUsername = document.getElementById('host-name').value.trim() || 'Host';

  try {
    localStream = await getLocalStream();
    document.getElementById('local-video').srcObject = localStream;

    createPeerConnection(true, code, myUsername);

    // Add local stream to peer connection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    // Setup signaling — host listens for answer, joiner listens for offer
    setupSignalingListener(code, null, handleAnswer, handleIceCandidate);

    // Create and send offer
    await hostCreateOffer();

    // Update UI
    document.getElementById('room-code-display').textContent = code;
    document.getElementById('call-ui').classList.remove('hidden');
    document.getElementById('host-setup').classList.add('hidden');

  } catch (err) {
    showMessage('call-msg', 'Could not access camera/microphone: ' + err.message, 'error');
  }
}

async function startCallAsJoiner(code, name) {
  hideMessage('call-msg');

  myCode = code;
  amIHost = false;
  myUsername = name;

  try {
    localStream = await getLocalStream();
    document.getElementById('local-video').srcObject = localStream;

    createPeerConnection(false, code, myUsername);

    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    // Setup signaling — joiner needs to receive the host's offer and then answer
    setupSignalingListener(code, handleOffer, null, handleIceCandidate);

    // Update UI
    document.getElementById('room-code-display').textContent = code;
    document.getElementById('call-ui').classList.remove('hidden');
    document.getElementById('join-setup').classList.add('hidden');
    // Start listening for participants so the UI stays up‑to‑date
    listenParticipants(code);

  } catch (err) {
    showMessage('call-msg', 'Could not access camera/microphone: ' + err.message, 'error');
  }
}

// --- Handle incoming offer (joiner side) ---
async function handleOffer(offerSdp) {
  if (amIHost) return; // Host doesn't handle offers

  await peerConnection.setRemoteDescription(new RTCSessionDescription({
    type: 'offer',
    sdp: offerSdp
  }));

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  if (signalingRef) {
    signalingRef.child('answer').set({
      sdp: answer.sdp,
      sender: myUsername,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
  }
}

// --- Handle incoming answer (host side) ---
async function handleAnswer(answerSdp) {
  if (!amIHost) return; // Only host handles answers

  await peerConnection.setRemoteDescription(new RTCSessionDescription({
    type: 'answer',
    sdp: answerSdp
  }));
}

// --- Handle ICE candidates ---
function handleIceCandidate(candidate) {
  if (peerConnection) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
  }
}

// --- End call ---
function endCall() {
  cleanupCall();

  // Update room status in Firestore
  if (myCode) {
    db.collection('rooms').doc(myCode).update({
      status: 'ended'
    }).catch(() => {});
  }

  navigateTo('dashboard.html');
}

// --- Mute/Unmute ---
function toggleMute() {
  if (!localStream) return;
  const audioTrack = localStream.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    const btn = document.getElementById('mute-btn');
    btn.textContent = audioTrack.enabled ? '🎤' : '🔇';
  }
}

// --- Video On/Off ---
function toggleVideo() {
  if (!localStream) return;
  const videoTrack = localStream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    const btn = document.getElementById('video-btn');
    btn.textContent = videoTrack.enabled ? '📹' : '🚫';
  }
}

// --- Initialize call page ---
function initCallPage() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const role = params.get('role'); // 'host' or 'join'
  const name = params.get('name');

  if (!code) {
    showMessage('call-msg', 'No room code provided.', 'error');
    return;
  }

  myCode = code;

  if (role === 'host') {
    document.getElementById('host-setup').classList.remove('hidden');
    const hostCodeEl = document.getElementById('host-code');
    if (hostCodeEl) hostCodeEl.textContent = code;
    const hostNameEl = document.getElementById('host-name');
    if (hostNameEl) hostNameEl.value = name || '';
  } else {
    document.getElementById('join-setup').classList.remove('hidden');
    const joinCodeEl = document.getElementById('join-code');
    if (joinCodeEl) joinCodeEl.textContent = code;
    const joinNameEl = document.getElementById('join-name');
    if (joinNameEl) joinNameEl.value = name || '';
  }
}
