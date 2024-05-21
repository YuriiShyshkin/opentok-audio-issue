/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */

let apiKey;
let sessionId;
let token;

let connectionIdToVideoTracks = new Map();
let connectionIdToRemoteParticipantsSubscriptions = new Map();
let publisher;
let confirmedToConnect = false;

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

function initializeSession() {
  const session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', (event) => {
    const subscriberCameraOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
      insertDefaultUI: false,
      subscribeToAudio: true,
      subscribeToVideo: false,
    };

    const remoteSubscription = session
      .subscribe(event.stream, undefined, subscriberCameraOptions, handleError)
      .on('videoElementCreated', (videoTrack) => {
        if (confirmedToConnect) {
          createCameraNode(videoTrack);
        } else {
          remoteSubscription.subscribeToAudio(false);
        }

        connectionIdToVideoTracks.set(event.stream.connection.id, videoTrack);
      });

    connectionIdToRemoteParticipantsSubscriptions.set(
      event.stream.connection.id,
      remoteSubscription
    );
  });

  session.on('sessionDisconnected', (event) => {
    console.log('You were disconnected from the session.', event.reason);
  });

  // initialize the publisher
  const publisherOptions = {
    publishAudio: false,
    publishVideo: false,
    insertDefaultUI: false,
    videoContentHint: 'text',
    resolution: '640x480',
    frameRate: 30,
  };

  publisher = OT.initPublisher(undefined, publisherOptions, handleError);
  publisher
    .on('videoElementCreated', (videoTrack) => {
      setTimeout(() => {
        connectionIdToVideoTracks.set(
          publisher.session.connection.id,
          videoTrack
        );
      }, 1000);
    })
    .on('streamCreated', function () {
      setTimeout(() => {
        document
          .getElementById('confirmationModal')
          .classList.remove('display-none');
      }, 1000);
    });
  // Connect to the session
  session.connect(token, (error) => {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      session.publish(publisher, handleError);
    }
  });
}

function confirm() {
  document.getElementById('confirmationModal').classList.add('display-none');
  const button = document.getElementById('audioButton');

  button.classList.remove('display-none');

  button.addEventListener('click', () => {
    button.classList.toggle('enabled');
    if (button.classList.contains('enabled')) {
      button.innerHTML = 'Disable Audio';
      publisher.publishAudio(true);
    } else {
      button.innerHTML = 'Enable Audio';
      publisher.publishAudio(false);
    }
  });

  subscribeToRemoteParticipantsStreams();

  Array.from(connectionIdToVideoTracks.values()).forEach((videoTrack) => {
    createCameraNode(videoTrack);
  });
}

function subscribeToRemoteParticipantsStreams() {
  Array.from(connectionIdToRemoteParticipantsSubscriptions.values()).forEach(
    (subscription) => {
      subscription.subscribeToAudio(true);
      subscription.subscribeToVideo(true);
    }
  );
}

function createCameraNode(videoTrack) {
  const videoNode = document.createElement('span');
  videoNode.classList.add('display-none');
  videoNode.id = videoTrack.target.stream.connection.id + 'camera';
  videoTrack.element.autoplay = false;
  videoTrack.element.play();

  videoNode.appendChild(videoTrack.element);

  document.getElementById('videos').appendChild(videoNode);
}

// See the config.js file.
if (API_KEY && SESSION_ID) {
  apiKey = API_KEY;
  sessionId = SESSION_ID;
}

function submitToken() {
  const tokenInput = document.getElementById('tokenInput');
  token = tokenInput.value;
  document.getElementById('tokenContainer').classList.add('display-none');

  initializeSession();
}
