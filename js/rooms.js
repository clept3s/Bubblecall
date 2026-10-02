/* === Room Management === */

// --- Create a new room ---
function createRoom(username) {
  const code = generateRoomCode();
  const user = auth.currentUser;

  if (!user) {
    showMessage('host-msg', 'You must be logged in to host a call.', 'error');
    return null;
  }

  const roomRef = db.collection('rooms').doc(code);

  return roomRef.get().then((doc) => {
    // Ensure code is unique
    if (doc.exists) {
      return createRoom(username); // Retry with new code
    }

    return roomRef.set({
      code: code,
      hostId: user.uid,
      hostName: username,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'waiting', // waiting, active, ended
      participants: firebase.firestore.FieldValue.arrayUnion(username)
    });
  }).then(() => {
    return code;
  }).catch((err) => {
    showMessage('host-msg', 'Failed to create room: ' + err.message, 'error');
    return null;
  });
}

// --- Join a room by code ---
function joinRoom(code, username) {
  if (!code || code.length !== 6) {
    showMessage('join-msg', 'Please enter a valid 6-digit code.', 'error');
    return null;
  }

  if (!username || username.length > 20) {
    showMessage('join-msg', 'Username must be 1-20 characters.', 'error');
    return null;
  }

  const roomRef = db.collection('rooms').doc(code);

  return roomRef.get().then((doc) => {
    if (!doc.exists) {
      showMessage('join-msg', 'Room not found.', 'error');
      return null;
    }

    const room = doc.data();
    if (room.status === 'ended') {
      showMessage('join-msg', 'This call has ended.', 'error');
      return null;
    }

    // Add participant
    return roomRef.update({
      participants: firebase.firestore.FieldValue.arrayUnion(username),
      status: 'active'
    }).then(() => {
      return { code, hostId: room.hostId, hostName: room.hostName };
    });
  }).catch((err) => {
    showMessage('join-msg', 'Failed to join room: ' + err.message, 'error');
    return null;
  });
}

// --- Get room info ---
function getRoom(code) {
  return db.collection('rooms').doc(code).get().then((doc) => {
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  });
}
