const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
  // input value
  let text = $("input");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
    }
  });
  socket.on("createMessage", message => {
    $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
    scrollToBottom()
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

function sendMessageOnClick() {
  const chatMessageInput = document.getElementById('chat_message');
  const message = chatMessageInput.value.trim();
  const messagesList = document.querySelector('.main__chat_window ul');

  if (message !== '') {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<b>User 1</b><br>${message}`;
      messagesList.appendChild(listItem);
      chatMessageInput.value = '';
      scrollToBotto();
  }
}

// Event listener for clicking to send message
document.getElementById('chat_message').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
      sendMessageOnClick();
  }
});
const scrollToBotto = () => {
  var chatWindow = document.querySelector('.main__chat_window');
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

 // Initially, the chat window is open

function toggleChatWindows() {
  const chatWindow = document.getElementById('chat-window');
  if (chatWindow.style.display === 'none') {
      chatWindow.style.display = 'block';
  } else {
      chatWindow.style.display = 'none';
  }
}
function leaveMeeting() {
  if (confirm("Are you sure you want to leave the meeting?")) {
    window.location.href = "about:blank";
  }
}
let isParticipantListVisible = false;


function listParticipants() {
  // Get the list of participants from the socket connection
  if (!isParticipantListVisible) {
    // Get the list of participants from the socket connection
    const participants = Object.keys(peers).length;

    // Display the number of participants
    const participantButton = document.getElementById('participants');
    participantButton.innerHTML = `<i class="fas fa-user-friends"></i><span>Participants (${participants+1})</span>`;

    isParticipantListVisible = true;
  } else {
    // Revert to the original state
    const participantButton = document.getElementById('participants');
    participantButton.innerHTML = `<i class="fas fa-user-friends"></i><span>Participants</span>`;

    isParticipantListVisible = false;
  }
}

function enterFullScreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen(); // Firefox
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen(); // Safari
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen(); // IE/Edge
  }
}

// Add event listener to the full_screen button
let btn = document.getElementById("full_screen");
btn.addEventListener("click", function() {
  let videoEle = document.querySelector('video');
  enterFullScreen(videoEle);
});

// Listen for the fullscreenchange event
document.addEventListener('fullscreenchange', (event) => {
  if (document.fullscreenElement) {
    console.log('Entered fullscreen:', document.fullscreenElement);
  } else {
    console.log('Exited fullscreen.');
  }
});
