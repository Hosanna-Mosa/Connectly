import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Badge, IconButton, TextField } from "@mui/material";
import { Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { useActionData, useNavigate } from "react-router-dom";

// import styles from "../utils/videoComponent.module.css";
import "../utils/VideoComponet.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
// import server from '../environment';
import server from "../../environment";

const server_url = server ;

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
const VideoComponet = () => {
  var socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoref = useRef();
  let msgInput = useRef(null);

  let [videoAvailable, setVideoAvailable] = useState(true);

  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState(true);

  let [audio, setAudio] = useState();

  let [screen, setScreen] = useState(false);

  let [showModal, setShowModal] = useState(true);

  let [screenAvailable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);

  let [message, setMessage] = useState("");

  let [newMessages, setNewMessages] = useState(0);

  let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);

  useEffect(() => {
    console.log("Taking Perissions...");
    getPermissions();
  });

  useEffect(() => {
    if (screen !== undefined) getDislayMedia();
  }, [screen]);

  let getDislayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
        console.log("Video permission granted");
      } else {
        setVideoAvailable(false);
        console.log("Video permission denied");
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
        console.log("Audio permission granted");
      } else {
        setAudioAvailable(false);
        console.log("Audio permission denied");
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoref.current) {
            localVideoref.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
      console.log("SET STATE HAS ", video, audio);
    }
  }, [video, audio]);
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  // console.log(videos);

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        console.log(description);
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) => new MediaStream([black(), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        })
    );
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  let getDislayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) => new MediaStream([black(), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          getUserMedia();
        })
    );
  };

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );
          //  addTracksToPeerConnection(connections[socketListId]);

          // Wait for their ice candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // Wait for their video stream
          connections[socketListId].onaddstream = (event) => {
            console.log("BEFORE:", videoRef.current);
            console.log("FINDING ID: ", socketListId);

            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            );

            if (videoExists) {
              console.log("FOUND EXISTING");

              // Update the stream of the existing video
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              // Create a new video
              console.log("CREATING NEW");
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          // let streamToSend = window.localStream;

          // if (!video) {
          //   const blackTrack = black().getVideoTracks()[0];
          //   console.log("🆕 New user joined — sending black track");
          //   streamToSend = new MediaStream([blackTrack]);
          // }

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            console.log("The New ---- User Old Video is Setting");

            connections[socketListId].addStream(window.localStream);
          } else {
            let streamToSend = window.localStream;

            if (!video) {
              const blackTrack = black().getVideoTracks()[0];
              console.log("🆕 New user joined — sending black track");
              streamToSend = new MediaStream([blackTrack]);
            }

            streamToSend.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, streamToSend);
            });
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  // let black = ({ width = 640, height = 480 } = {}) => {
  //   let canvas = Object.assign(document.createElement("canvas"), {
  //     width,
  //     height,
  //   });

  //   canvas.getContext("2d").fillRect(0, 0, width, height);
  //   let stream = canvas.captureStream();
  //   return Object.assign(stream.getVideoTracks()[0], { enabled: false });

  // };

  function black() {
    const canvas = Object.assign(document.createElement("canvas"), {
      width: 640,
      height: 480,
    });
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.captureStream();
  }

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  let handleVideo = () => {
    const videoState = !video;
    setVideo(videoState);
    console.log("[handleVideo]", "Turning camera", videoState ? "ON" : "OFF");

    if (!videoState) {
      console.log("🛑 Camera OFF: Creating black stream");
      const blackTrack = black().getVideoTracks()[0];
      console.log("🧪 Black track:", blackTrack);

      const oldTrack = window.localStream.getVideoTracks()[0];
      if (oldTrack) {
        console.log("🧼 Stopping old track");
        oldTrack.stop();
        window.localStream.removeTrack(oldTrack);
      }
      window.localStream.addTrack(blackTrack);

      for (let id in connections) {
        const sender = connections[id]
          .getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) {
          console.log("🔄 Replacing track in connection:", id);
          sender.replaceTrack(blackTrack);
        }
      }
    } else {
      console.log("Reconnecting the Camera video");

      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        const newTrack = stream.getVideoTracks()[0];

        // Replace in local stream
        const oldTrack = window.localStream.getVideoTracks()[0];
        window.localStream.removeTrack(oldTrack);
        oldTrack.stop();
        window.localStream.addTrack(newTrack);

        // Replace in peer connections
        for (let id in connections) {
          const sender = connections[id]
            .getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender) {
            sender.replaceTrack(newTrack);
          }
        }
      });
    }
  };

  let handleAudio = () => {
    setAudio(!audio);
  };

  let handleScreen = () => {
    if (!video) {
      alert("The Camera must be on");
    } else {
      setScreen(!screen);
    }
  };

  let handleShowModal = () => {
    setShowModal(!showModal);
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
    // msgInput.current.focus();
    // console.log(msgInput.currentvalue);
    msgInput.current.value = "";
  };

  let routeTo = useNavigate();

  let handleEndVideoCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (error) {}
    routeTo("/home");
  };
  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2 className="lobbytext">Enter into Lobby </h2>
          <div className="prereviewContainer" >
            
            <div className="prereviewVideo">
              <video
                ref={localVideoref}
                autoPlay
                muted
                className="previewVideoframe"
              ></video>
            </div>

            <div className="userInput">
              <TextField
                id="outlined-basic"
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
              />
              <Button variant="contained"  onClick={connect}>
                Connect
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="meetVideocontainer">
          helloGuru1{videos.length}
          {showModal && (
            <div className="chattingRoom">
              <div className="chattingContainer">
                <h1>Chat</h1>
                <div className="chattingDisplay">
                  {messages.length > 0
                    ? messages.map((item, index) => {
                        return (
                          <div key={index} style={{ marginBottom: 20 }}>
                            <h4>{item.sender}</h4>
                            <p>{item.data}</p>
                          </div>
                        );
                      })
                    : null}
                </div>

                <div className="chattingArea">
                  <TextField
                    id="filled-basic"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    label="Filled"
                    variant="filled"
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div
            className={
              videos.length <= 1
                ? "singleUser"
                : `multipleUser ${videos.length > 2 ? "scrollable" : null}`
            }
            style={showModal ? { marginLeft: 0 } : null}
          >
            {video ? (
              <video ref={localVideoref} autoPlay muted></video>
            ) : (
              <div className={videos.length <= 1 ? null : null}></div>
            )}
            {/* <video ref={localVideoref} autoPlay muted></video> */}
            {videos.map((videoi) => (
              <div key={videoi.socketId}>
                {/* <h2>{video.socketId}</h2> */}

                <video
                  data-socket={videoi.socketId}
                  ref={(ref) => {
                    if (ref && videoi.stream) ref.srcObject = videoi.stream;
                  }}
                  autoPlay
                  // muted
                  className={videos.length === 1 ? "doubleUser" : null}
                ></video>
              </div>
            ))}
          </div>
          <div className="buttonsContainer">
            <IconButton style={{ color: "white" }} onClick={handleVideo}>
              {video === true ? (
                <VideocamIcon />
              ) : (
                <VideocamOffIcon></VideocamOffIcon>
              )}
            </IconButton>
            <IconButton style={{ color: "white" }} onClick={handleAudio}>
              {audio === true ? <MicIcon /> : <MicOffIcon></MicOffIcon>}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton style={{ color: "white" }} onClick={handleScreen}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon></StopScreenShareIcon>
                )}
              </IconButton>
            ) : null}

            <Badge badgeContent={newMessages} max={999} color="warning">
              <IconButton style={{ color: "white" }} onClick={handleShowModal}>
                {/* {audio === true ?  <MicIcon /> : <MicOffIcon></MicOffIcon>} */}
                <ChatIcon />
              </IconButton>
            </Badge>

            <IconButton onClick={handleEndVideoCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoComponet;
