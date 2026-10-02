/* === WebRTC Peer Connection === */

const PEER_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};
10 | // Use `var` (or attach to `window`) so the variables are shared across the
11 | // separate script files (`webrtc.js` and `call.js`). In a plain HTML page
12 | // each <script> tag runs in its own module scope, so `let` would not be
13 | // accessible from `call.js`. Making them global allows the call logic to
14 | // reference the same stream, peer connection and signaling reference.
15 | var localStream = null;
16 | var peerConnection = null;
17 | var isHost = false;
18 | var roomCode = null;
19 | var username = null;
20 | var signalingRef = null;
let signalingRef = null;

// --- Get local media stream ---
function getLocalStream() {
  return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
}

// --- Initialize peer connection ---
function createPeerConnection(isHostRole, code, user) {
  isHost = isHostRole;
  roomCode = code;
  username = user;

  peerConnection = new RTCPeerConnection(PEER_CONFIG);

  // Add local stream tracks
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
  }

  // Handle remote stream
  peerConnection.ontrack = (event) => {
    const remoteVideo = document.getElementById('remote-video');
    if (remoteVideo) {
      remoteVideo.srcObject = event.streams[0];
    }
  };

  // ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate && signalingRef) {
      signalingRef.child('iceCandidates').push({
        candidate: event.candidate,
        sender: username,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });
    }
  };

  return peerConnection;
}

// --- Host creates offer ---
async function hostCreateOffer() {
  if (!peerConnection) return;

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  // Send offer via signaling
  if (signalingRef) {
    signalingRef.child('offer').set({
      sdp: offer.sdp,
      sender: username,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
  }
}

// --- Joiner handles offer and creates answer ---
async function handleOffer(offerSdp) {
  if (!peerConnection) return;

  await peerConnection.setRemoteDescription(new RTCSessionDescription({
    type: 'offer',
    sdp: offerSdp
  }));

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  if (signalingRef) {
    signalingRef.child('answer').set({
      sdp: answer.sdp,
      sender: username,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
  }
}

// --- Host handles answer ---
async function handleAnswer(answerSdp) {
  if (!peerConnection) return;

  await peerConnection.setRemoteDescription(new RTCSessionDescription({
    type: 'answer',
    sdp: answerSdp
  }));
}

// --- Listen for signaling ---
function setupSignalingListener(code, onOffer, onAnswer, onIceCandidate) {
  const ref = rtdb.ref('rooms/' + code + '/signaling');
  signalingRef = ref;

  ref.on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (!data || data.sender === username) return;

    if (data.sdp) {
      if (data.sdp.type === 'offer') {
        onOffer(data.sdp);
      } else if (data.sdp.type === 'answer') {
        onAnswer(data.sdp);
      }
    }
  });

  ref.child('iceCandidates').on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (!data || data.sender === username) return;
    if (onIceCandidate && data.candidate) {
      onIceCandidate(data.candidate);
    }
  });
}

// --- Clean up ---
function cleanupCall() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (signalingRef) {
    signalingRef.off();
    signalingRef = null;
  }
}
