console.log("index js file");
var ws;

async function connect() {
  return new Promise(function (resolve, reject) {
    ws = new WebSocket("ws://localhost:3434/ws");
    ws.onopen = function () {
      resolve(ws);
    };
    ws.onerror = function (err) {
      reject(err);
    };
  });
}

var camHold = false;
var micHold = false;
var micTimeout, camTimeout;

async function handleSDEvent(action, event) {
  switch (event) {
    case "keyDown":
      switch (action) {
        case "com.chadbailey.covalent.cam":
          toggleCam();
          camTimeout = setTimeout(() => {
            camHold = true;
          }, 500);
          //ws.send("foo");
          break;
        case "com.chadbailey.covalent.mic":
          toggleMic();
          micTimeout = setTimeout(() => {
            micHold = true;
          }, 500);
          break;
      }
      break;

    case "keyUp":
      switch (action) {
        case "com.chadbailey.covalent.cam":
          // if camHold = false, timeout hasn't fired, so it's a quick button press
          // cancel the timeout and ignore the action
          if (camHold == false) {
            clearTimeout(camTimeout);
            // but send the state again, because stream deck just toggles state :(
            sendState(getCam(), getMic());
          } else {
            toggleCam();
            camHold = false;
          }
          break;
        case "com.chadbailey.covalent.mic":
          if (micHold == false) {
            clearTimeout(micTimeout);
            // but send the state again, because stream deck just toggles state :(
            sendState(getCam(), getMic());
          } else {
            toggleMic();
            micHold = false;
          }
          break;
      }
      break;
  }
}

function getMic() {
  return window.call.localAudio();
}

function getCam() {
  return window.call.localVideo();
}

function toggleMic(s) {
  if (s === undefined) s = !getMic();
  console.log("setting mic to ", s);
  window.call.setLocalAudio(s);
}

function toggleCam(s) {
  if (s === undefined) s = !getCam();
  console.log("setting cam to ", s);
  window.call.setLocalVideo(s);
}

exports.open = async () => {
  await connect();
  console.log("opened websocket: ", ws);
  /* ws.addEventListener("open", (e) => {
    ws.send("Hello there! nice to meet you");
  }); */
  ws.onmessage = (msg) => {
    console.log("message received: ", msg);
    try {
      var m = JSON.parse(msg.data);
      console.log("action: ", m.action);
      console.log("event: ", m.event);
      // only catch keyDown, leave keyUp for the other handlers
      handleSDEvent(m.action, m.event);
    } catch (e) {
      console.log("error processing websocket message: ", e);
    }
  };
};

exports.close = () => {
  console.log("closing stream deck websocket");
  ws.close();
};

function sendState(videoState, audioState) {
  console.log("sending state: ", videoState, audioState);
  var msg = { message: "update-state", data: {} };
  msg.data.audio = audioState ? 0 : 1;
  msg.data.video = videoState ? 0 : 1;
  ws.send(JSON.stringify(msg));
}

exports.sendState = sendState;
