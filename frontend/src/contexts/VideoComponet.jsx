import React, { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";
import { Badge, IconButton, TextField } from "@mui/material";
import { Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { useNavigate } from "react-router-dom";

// import styles from "../utils/videoComponent.module.css";
import "../utils/VideoComponet.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
// import server from '../environment';
import server from "../environment";
import CommentsDisabledIcon from "@mui/icons-material/CommentsDisabled";

const server_url = server;

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
const VideoComponet = () => {
  const socketRef = useRef();
  const socketIdRef = useRef();

  const localVideoref = useRef();
  const msgInput = useRef(null);

  const [videoAvailable, setVideoAvailable] = useState(false);

  const [audioAvailable, setAudioAvailable] = useState(false);

  const [video, setVideo] = useState(false);

  const [audio, setAudio] = useState(false);

  const [screen, setScreen] = useState(false);

  const [showModal, setShowModal] = useState(true);

  const [screenAvailable, setScreenAvailable] = useState(false);

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [newMessages, setNewMessages] = useState(0);

  const [askForUsername, setAskForUsername] = useState(true);

  const [username, setUsername] = useState("");

  const videoRef = useRef([]);

  const [videos, setVideos] = useState([]);

  const [isInitialized, setIsInitialized] = useState(false);

  // Keep the canvas element alive in a ref
  const blackCanvasRef = useRef(null);

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    if (screen !== undefined) getDisplayMedia();
  }, [screen]);

  useEffect(() => {
    if (isInitialized && video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio, isInitialized]);

  useEffect(() => {
    return () => {
      cleanupMediaStreams();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const cleanupMediaStreams = useCallback(() => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
      Object.values(connections).forEach((connection) => {
        if (connection) {
          connection.close();
        }
      });
      connections = {};
    } catch (error) {
      console.error("Error cleaning up media streams:", error);
    }
  }, []);

  const getDisplayMedia = useCallback(() => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .catch(() => {
            setScreen(false);
          });
      }
    }
  }, [screen]);

  const getPermissions = useCallback(async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setVideoAvailable(!!videoPermission);

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setAudioAvailable(!!audioPermission);

      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

      setVideo(!!videoPermission);
      setAudio(!!audioPermission);

      if (videoPermission || audioPermission) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: !!videoPermission,
          audio: !!audioPermission,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoref.current) {
            localVideoref.current.srcObject = userMediaStream;
          }
          setIsInitialized(true);
        }
      }
    } catch (error) {
      console.error("Error getting permissions:", error);
      setVideoAvailable(false);
      setAudioAvailable(false);
      setVideo(false);
      setAudio(false);
    }
  }, []);

  const getMedia = useCallback(() => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  }, [videoAvailable, audioAvailable]);

  const getUserMediaSuccess = useCallback((stream) => {
    try {
      // Stop existing tracks
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.error("Error stopping existing tracks:", e);
    }

    window.localStream = stream;
    if (localVideoref.current) {
      localVideoref.current.srcObject = stream;
    }

    // Update all peer connections with new stream
    Object.keys(connections).forEach((id) => {
      if (id === socketIdRef.current) return;

      try {
        connections[id].addStream(window.localStream);
        connections[id].createOffer().then((description) => {
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              if (socketRef.current) {
                socketRef.current.emit(
                  "signal",
                  id,
                  JSON.stringify({ sdp: connections[id].localDescription })
                );
              }
            })
            .catch((e) => console.error("Error setting local description:", e));
        });
      } catch (error) {
        console.error("Error updating peer connection:", error);
      }
    });

    // Handle track ended events
    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);

        try {
          if (localVideoref.current?.srcObject) {
            const tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          }
        } catch (e) {
          console.error("Error stopping tracks:", e);
        }

        // Create black/silence stream
        const blackSilence = () =>
          new MediaStream([createBlackVideoTrack(), silence()]);
        window.localStream = blackSilence();
        if (localVideoref.current) {
          localVideoref.current.srcObject = window.localStream;
        }

        // Update peer connections
        Object.keys(connections).forEach((id) => {
          try {
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  if (socketRef.current) {
                    socketRef.current.emit(
                      "signal",
                      id,
                      JSON.stringify({ sdp: connections[id].localDescription })
                    );
                  }
                })
                .catch((e) =>
                  console.error("Error setting local description:", e)
                );
            });
          } catch (error) {
            console.error("Error updating peer connection:", error);
          }
        });
      };
    });
  }, []);

  const getUserMedia = useCallback(() => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch(() => {
          setVideoAvailable(false);
          setAudioAvailable(false);
        });
    } else {
      try {
        if (localVideoref.current?.srcObject) {
          const tracks = localVideoref.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        }
      } catch (e) {
        console.error("Error stopping tracks:", e);
      }
    }
  }, [video, audio, videoAvailable, audioAvailable, getUserMediaSuccess]);

  const getDisplayMediaSuccess = useCallback(
    (stream) => {
      try {
        if (window.localStream) {
          window.localStream.getTracks().forEach((track) => track.stop());
        }
      } catch (e) {
        console.error("Error stopping existing tracks:", e);
      }

      window.localStream = stream;
      if (localVideoref.current) {
        localVideoref.current.srcObject = stream;
      }

      Object.keys(connections).forEach((id) => {
        if (id === socketIdRef.current) return;

        try {
          connections[id].addStream(window.localStream);
          connections[id].createOffer().then((description) => {
            connections[id]
              .setLocalDescription(description)
              .then(() => {
                if (socketRef.current) {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                }
              })
              .catch((e) =>
                console.error("Error setting local description:", e)
              );
          });
        } catch (error) {
          console.error("Error updating peer connection:", error);
        }
      });

      stream.getTracks().forEach((track) => {
        track.onended = () => {
          setScreen(false);

          try {
            if (localVideoref.current?.srcObject) {
              const tracks = localVideoref.current.srcObject.getTracks();
              tracks.forEach((track) => track.stop());
            }
          } catch (e) {
            console.error("Error stopping tracks:", e);
          }

          const blackSilence = () =>
            new MediaStream([createBlackVideoTrack(), silence()]);
          window.localStream = blackSilence();
          if (localVideoref.current) {
            localVideoref.current.srcObject = window.localStream;
          }

          getUserMedia();
        };
      });
    },
    [getUserMedia]
  );

  const gotMessageFromServer = useCallback((fromId, message) => {
    try {
      const signal = JSON.parse(message);
      if (fromId !== socketIdRef.current && connections[fromId]) {
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
                        if (socketRef.current) {
                          socketRef.current.emit(
                            "signal",
                            fromId,
                            JSON.stringify({
                              sdp: connections[fromId].localDescription,
                            })
                          );
                        }
                      })
                      .catch((e) =>
                        console.error("Error setting local description:", e)
                      );
                  })
                  .catch((e) => console.error("Error creating answer:", e));
              }
            })
            .catch((e) =>
              console.error("Error setting remote description:", e)
            );
        }
        if (signal.ice) {
          connections[fromId]
            .addIceCandidate(new RTCIceCandidate(signal.ice))
            .catch((e) => console.error("Error adding ICE candidate:", e));
        }
      }
    } catch (error) {
      console.error("Error parsing signal message:", error);
    }
  }, []);

  const addMessage = useCallback((data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data, timestamp: Date.now() },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  }, []);

  const connectToSocketServer = useCallback(() => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (socketListId === socketIdRef.current) return;

          // Create new peer connection
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );

          // Modern ontrack handler
          connections[socketListId].ontrack = (event) => {
            setVideos((videos) => {
              const existingVideo = videos.find(
                (video) => video.socketId === socketListId
              );
              if (existingVideo) {
                return videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.streams[0] }
                    : video
                );
              } else {
                const newVideo = {
                  socketId: socketListId,
                  stream: event.streams[0],
                  autoPlay: true,
                  playsinline: true,
                };
                return [...videos, newVideo];
              }
            });
          };

          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null && socketRef.current) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // Add all tracks from local stream to the new connection
          if (window.localStream) {
            try {
              window.localStream.getTracks().forEach((track) => {
                connections[socketListId].addTrack(track, window.localStream);
              });
            } catch (error) {
              console.error("Error adding tracks to peer connection:", error);
            }
          }
        });

        if (id === socketIdRef.current) {
          Object.keys(connections).forEach((id2) => {
            if (id2 === socketIdRef.current) return;

            try {
              // Remove all senders before adding new tracks
              connections[id2].getSenders().forEach((sender) => {
                if (sender.track) {
                  connections[id2].removeTrack(sender);
                }
              });
              if (window.localStream) {
                window.localStream.getTracks().forEach((track) => {
                  connections[id2].addTrack(track, window.localStream);
                });
              }
            } catch (e) {
              console.error("Error adding tracks to existing connection:", e);
            }

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  if (socketRef.current) {
                    socketRef.current.emit(
                      "signal",
                      id2,
                      JSON.stringify({ sdp: connections[id2].localDescription })
                    );
                  }
                })
                .catch((e) =>
                  console.error("Error setting local description:", e)
                );
            });
          });
        }
      });
    });
  }, [gotMessageFromServer, addMessage]);

  // Create silence audio track
  const silence = useCallback(() => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  }, []);

  // Alternative black video track for debugging (canvas stays alive)
  const createAlternativeBlackVideoTrack = useCallback(() => {
    if (!blackCanvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
      ctx.fillStyle = "#ffffff";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("CAMERA OFF", canvas.width / 2, canvas.height / 2);
      blackCanvasRef.current = canvas;
    }
    const stream = blackCanvasRef.current.captureStream(30);
    const videoTrack = stream.getVideoTracks()[0];
    videoTrack.enabled = true;
    return videoTrack;
  }, []);

  // Use the alternative black video track for black stream
  const createBlackStream = useCallback(() => {
    const blackVideoTrack = createAlternativeBlackVideoTrack();
    const tracks = [blackVideoTrack];
    if (audio && window.localStream) {
      const audioTrack = window.localStream.getAudioTracks()[0];
      if (audioTrack) tracks.push(audioTrack);
    } else {
      tracks.push(silence());
    }
    const blackStream = new MediaStream(tracks);
    return blackStream;
  }, [audio, createAlternativeBlackVideoTrack, silence]);

  // Update the testBlackStream function to use the new black stream
  const testBlackStream = useCallback(() => {
    try {
      const blackStream = createBlackStream();
      if (!blackStream) {
        return null;
      }
      if (localVideoref.current) {
        localVideoref.current.srcObject = blackStream;
      }
      return blackStream;
    } catch (error) {
      console.error("❌ Error creating black stream:", error);
      return null;
    }
  }, [createBlackStream, localVideoref]);

  const connect = useCallback(() => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    setAskForUsername(false);
    getMedia();
    getUserMedia();
  }, [username, getMedia, getUserMedia]);

  // Handle video toggle - FINAL VERSION WITH full stream replacement and renegotiation
  const handleVideo = useCallback(() => {
    const videoState = !video;
    setVideo(videoState);
    if (!videoState) {
      const blackStream = createBlackStream();
      window.localStream = blackStream;
      Object.keys(connections).forEach((id) => {
        try {
          connections[id].getSenders().forEach((sender) => {
            if (sender.track) {
              connections[id].removeTrack(sender);
            }
          });
          blackStream.getTracks().forEach((track) => {
            connections[id].addTrack(track, blackStream);
          });
          connections[id].createOffer().then((description) => {
            connections[id].setLocalDescription(description).then(() => {
              if (socketRef.current) {
                socketRef.current.emit(
                  "signal",
                  id,
                  JSON.stringify({ sdp: connections[id].localDescription })
                );
              }
            });
          });
        } catch (error) {
          console.error(
            "Error updating peer connection (black stream):",
            error
          );
        }
      });
    } else {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: audio })
        .then((stream) => {
          try {
            if (window.localStream) {
              window.localStream.getTracks().forEach((track) => track.stop());
            }
            window.localStream = stream;
            if (localVideoref.current) {
              localVideoref.current.srcObject = stream;
            }
            Object.keys(connections).forEach((id) => {
              try {
                connections[id].getSenders().forEach((sender) => {
                  if (sender.track) {
                    connections[id].removeTrack(sender);
                  }
                });
                stream.getTracks().forEach((track) => {
                  connections[id].addTrack(track, stream);
                });
                connections[id].createOffer().then((description) => {
                  connections[id].setLocalDescription(description).then(() => {
                    if (socketRef.current) {
                      socketRef.current.emit(
                        "signal",
                        id,
                        JSON.stringify({
                          sdp: connections[id].localDescription,
                        })
                      );
                    }
                  });
                });
              } catch (error) {
                console.error(
                  "Error updating peer connection (camera stream):",
                  error
                );
              }
            });
          } catch (error) {
            console.error("❌ Error handling video on:", error);
          }
        })
        .catch(() => {
          setVideo(false); // Reset state on error
        });
    }
  }, [video, audio, createBlackStream, localVideoref]);

  const handleAudio = useCallback(() => {
    const audioState = !audio;
    setAudio(audioState);

    if (!audioState) {
      const silenceTrack = silence();

      try {
        const oldTrack = window.localStream?.getAudioTracks()[0];
        if (oldTrack) {
          oldTrack.stop();
          window.localStream.removeTrack(oldTrack);
        }
        window.localStream.addTrack(silenceTrack);

        Object.keys(connections).forEach((id) => {
          const sender = connections[id]
            .getSenders()
            .find((s) => s.track?.kind === "audio");
          if (sender) {
            sender.replaceTrack(silenceTrack);
          }
        });
      } catch (error) {
        console.error("Error handling audio off:", error);
      }
    } else {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const newTrack = stream.getAudioTracks()[0];

          try {
            const oldTrack = window.localStream?.getAudioTracks()[0];
            if (oldTrack) {
              window.localStream.removeTrack(oldTrack);
              oldTrack.stop();
            }
            window.localStream.addTrack(newTrack);

            Object.keys(connections).forEach((id) => {
              const sender = connections[id]
                .getSenders()
                .find((s) => s.track?.kind === "audio");
              if (sender) {
                sender.replaceTrack(newTrack);
              }
            });
          } catch (error) {
            console.error("Error handling audio on:", error);
          }
        })
        .catch(() => {
          setAudio(false);
        });
    }
  }, [audio, silence]);

  const handleScreen = useCallback(() => {
    if (!video) {
      alert("The Camera must be on for screen sharing");
    } else {
      setScreen(!screen);
    }
  }, [video, screen]);

  const handleShowModal = useCallback(() => {
    setShowModal(!showModal);
    if (showModal) {
      setNewMessages(0);
    }
  }, [showModal]);

  const sendMessage = useCallback(() => {
    if (!message.trim()) return;

    if (socketRef.current) {
      socketRef.current.emit("chat-message", message, username);
      setMessage("");
      if (msgInput.current) {
        msgInput.current.value = "";
      }
    }
  }, [message, username]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    },
    [sendMessage]
  );

  const navigate = useNavigate();

  const handleEndVideoCall = useCallback(() => {
    try {
      cleanupMediaStreams();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    } catch (error) {
      console.error("Error ending call:", error);
    }
    navigate("/home");
  }, [cleanupMediaStreams, navigate]);

  return (
    <div>
      {askForUsername ? (
        <div>
          <h2 className="lobbytext">Enter into Lobby</h2>
          <div className="prereviewContainer">
            <div className="prereviewVideo">
              <video
                ref={localVideoref}
                autoPlay
                muted
                playsInline
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
                onKeyPress={(e) => e.key === "Enter" && connect()}
                required
              />
              <Button
                variant="contained"
                onClick={connect}
                disabled={!username.trim()}
              >
                Connect
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="meetVideocontainer">
          <div style={{ display: "none" }}>Participants: {videos.length}</div>

          {showModal && (
            <div className="chattingRoom">
              <div className="chattingContainer">
                <h1>Chat</h1>
                <div className="chattingDisplay">
                  {messages.length > 0 ? (
                    messages.map((item, index) => (
                      <div key={index} style={{ marginBottom: 20 }}>
                        <h4>{item.sender}</h4>
                        <p>{item.data}</p>
                      </div>
                    ))
                  ) : (
                    <p>No messages yet</p>
                  )}
                </div>

                <div className="chattingArea">
                  <TextField
                    id="filled-basic"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    label="Type your message"
                    variant="filled"
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={sendMessage}
                    className="msgSendBtn"
                    disabled={!message.trim()}
                  >
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
                : `multipleUser ${videos.length > 1 ? "scrollable" : ""}`
            }
            style={showModal ? { marginLeft: 0 } : {}}
          >
            <video
              ref={localVideoref}
              autoPlay
              muted
              playsInline
              className="previewVideoframe"
              style={{ background: !video ? "black" : undefined }}
            ></video>

            {videos.map((videoItem) => (
              <div key={videoItem.socketId}>
                <video
                  data-socket={videoItem.socketId}
                  ref={(ref) => {
                    if (ref && videoItem.stream) {
                      ref.srcObject = videoItem.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                  className={videos.length === 1 ? "doubleUser" : ""}
                ></video>
              </div>
            ))}
          </div>

          <div className="buttonsContainer">
            <IconButton
              style={{ color: video ? "white" : "red" }}
              onClick={handleVideo}
              title={video ? "Turn off camera" : "Turn on camera"}
            >
              {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton
              style={{ color: audio ? "white" : "red" }}
              onClick={handleAudio}
              title={audio ? "Mute microphone" : "Unmute microphone"}
            >
              {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable && (
              <IconButton
                style={{ color: screen ? "green" : "white" }}
                onClick={handleScreen}
                title={screen ? "Stop screen sharing" : "Start screen sharing"}
              >
                {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
              </IconButton>
            )}

            <Badge badgeContent={newMessages} max={999} color="warning">
              <IconButton
                style={{ color: "white" }}
                onClick={handleShowModal}
                title={showModal ? "Close chat" : "Open chat"}
              >
                {showModal ? <CommentsDisabledIcon /> : <ChatIcon />}
              </IconButton>
            </Badge>

            <IconButton
              onClick={handleEndVideoCall}
              style={{ color: "red" }}
              title="End call"
            >
              <CallEndIcon />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoComponet;
