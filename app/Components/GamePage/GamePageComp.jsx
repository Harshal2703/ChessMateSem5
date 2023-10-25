"use client";
import Image from "next/image";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import {} from "../../../firbaseConfig";
import { getDatabase, ref, set, onValue } from "firebase/database";

let AgoraRTC_N4190 = null;

export const GamePageComp = () => {
  const [gameId, setGameId] = useState(null);
  const [gameObj, setGameObj] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [whoIm, setWhoIm] = useState(null);
  const [chat, setChat] = useState(null);
  const [positionFenStr, setPositionFenStr] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [gameOver, setGameOver] = useState(false);
  const [clientObj, setClientObj] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [opponentVideo, setOpponentVideo] = useState(null);
  const [opponentAudio, setOpponentAudio] = useState(null);
  const chess = new Chess();

  async function handleOfferDraw() {
    if (gameObj && gameObj["gameOn"]) {
      writeGameData(gameId, whoIm, "/drawOfferedFrom");
    }
  }

  async function handleDrawResponse(acc, rej) {
    if (acc) {
      handleGameOver("draw");
    }
    if (rej) {
      writeGameData(gameId, "noone", "/drawOfferedFrom");
    }
  }

  async function writeGameData(gameId, payload, route) {
    const db = getDatabase();
    await set(ref(db, "games/" + gameId + route), payload);
  }

  async function handleBackToHomePage() {
    router.push("/");
  }

  async function handleGameOver(reason) {
    if (gameObj && gameObj["gameOn"]) {
      let ratingOfChallenger = 0;
      let ratingOfAcceptor = 0;
      if (reason === "resign") {
        if (whoIm === "challenger") {
          ratingOfChallenger = gameObj["challengerInfo"]["rating"] - 8;
          ratingOfAcceptor = gameObj["acceptorInfo"]["rating"] + 8;
        } else if (whoIm === "acceptor") {
          ratingOfAcceptor = gameObj["acceptorInfo"]["rating"] - 8;
          ratingOfChallenger = gameObj["challengerInfo"]["rating"] + 8;
        }
      } else if (reason === "draw") {
        if (whoIm === "challenger") {
          ratingOfChallenger = gameObj["challengerInfo"]["rating"];
          ratingOfAcceptor = gameObj["acceptorInfo"]["rating"];
        } else if (whoIm === "acceptor") {
          ratingOfAcceptor = gameObj["acceptorInfo"]["rating"];
          ratingOfChallenger = gameObj["challengerInfo"]["rating"];
        }
      } else if (reason === "checkmate") {
        if (whoIm === "challenger") {
          ratingOfChallenger = gameObj["challengerInfo"]["rating"] + 8;
          ratingOfAcceptor = gameObj["acceptorInfo"]["rating"] - 8;
        } else if (whoIm === "acceptor") {
          ratingOfAcceptor = gameObj["acceptorInfo"]["rating"] + 8;
          ratingOfChallenger = gameObj["challengerInfo"]["rating"] - 8;
        }
      }
      const res = await fetch("/api/game/gameOver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
          gameObj,
          ratingOfChallenger,
          ratingOfAcceptor,
        }),
      });
      const data = JSON.parse(JSON.stringify(await res.json()));
      if (reason === "resign") {
        writeGameData(gameId, "resign", "/gameOverReason");
        if (whoIm === "challenger") {
          writeGameData(gameId, -8, "/changeInRatingOfChallenger");
          writeGameData(gameId, +8, "/changeInRatingOfAcceptor");
        } else if (whoIm === "acceptor") {
          writeGameData(gameId, +8, "/changeInRatingOfChallenger");
          writeGameData(gameId, -8, "/changeInRatingOfAcceptor");
        }
        writeGameData(gameId, true, "/gameOver");
      } else if (reason === "draw") {
        writeGameData(gameId, "draw", "/gameOverReason");
        writeGameData(gameId, 0, "/changeInRatingOfChallenger");
        writeGameData(gameId, 0, "/changeInRatingOfAcceptor");
        writeGameData(gameId, true, "/gameOver");
      } else if (reason === "checkmate") {
        writeGameData(gameId, "checkmate", "/gameOverReason");
        if (whoIm === "challenger") {
          writeGameData(gameId, +8, "/changeInRatingOfChallenger");
          writeGameData(gameId, -8, "/changeInRatingOfAcceptor");
        } else if (whoIm === "acceptor") {
          writeGameData(gameId, -8, "/changeInRatingOfChallenger");
          writeGameData(gameId, +8, "/changeInRatingOfAcceptor");
        }
        writeGameData(gameId, true, "/gameOver");
      }
    }
  }

  function toss() {
    const randomNumber = Math.random();
    const randomBoolean = randomNumber < 0.5;
    return randomBoolean;
  }

  const router = useRouter();
  useEffect(() => {
    AgoraRTC_N4190 = require("../../AgoraRTC_N-4.19.0");
    fetch("/api/getInfo")
      .then((res) => {
        res
          .json()
          .then(({ data }) => {
            if (data && data["active-game"]) {
              setGameId(data["active-game"]);
            }
            setUserInfo(data);
            const db = getDatabase();
            onValue(ref(db, "games/" + data["active-game"]), (snapshot) => {
              const rtdata = snapshot.val();
              setGameObj(rtdata);
              if (rtdata["gameOver"]) {
                setGameOver(true);
              }

              if (rtdata["gameOn"] && rtdata["latestMove"]) {
                setPositionFenStr(rtdata["latestMove"]["fen"]);
              }
              if (rtdata["challengerInfo"]["email"] === data["email"]) {
                setWhoIm("challenger");
              } else {
                setWhoIm("acceptor");
              }
              if (rtdata["aborted"]) {
                router.push("/");
              }
              if (
                !rtdata["gameOn"] &&
                rtdata["challengerReady"] &&
                rtdata["acceptorReady"]
              ) {
                if (rtdata["challengerInfo"]["email"] === data["email"]) {
                  writeGameData(rtdata["gameId"], true, "/gameOn");
                  writeGameData(
                    rtdata["gameId"],
                    [
                      {
                        by: "challenger",
                        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                      },
                    ],
                    "/moves"
                  );
                  writeGameData(
                    rtdata["gameId"],
                    {
                      by: "challenger",
                      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                    },
                    "/latestMove"
                  );
                  writeGameData(
                    rtdata["gameId"],
                    0,
                    "/challengerTotalTimePlayed"
                  );
                  writeGameData(
                    rtdata["gameId"],
                    0,
                    "/acceptorTotalTimePlayed"
                  );
                  const timerTimestamp = Date.now();
                  writeGameData(
                    rtdata["gameId"],
                    timerTimestamp,
                    "/timerTimeStamp"
                  );
                  if (toss()) {
                    writeGameData(rtdata["gameId"], "challenger", "/white");
                    writeGameData(rtdata["gameId"], "acceptor", "/black");
                    writeGameData(rtdata["gameId"], true, "/challengerTimerOn");
                    writeGameData(rtdata["gameId"], false, "/acceptorTimerOn");
                  } else {
                    writeGameData(rtdata["gameId"], "acceptor", "/white");
                    writeGameData(rtdata["gameId"], "challenger", "/black");
                    writeGameData(
                      rtdata["gameId"],
                      false,
                      "/challengerTimerOn"
                    );
                    writeGameData(rtdata["gameId"], true, "/acceptorTimerOn");
                  }
                }
              }
            });
          })
          .catch((err) => {
            router.push("/signin");
          });
      })
      .catch((err) => {
        router.push("/signin");
      });
  }, []);

  const abortGame = async () => {
    if (gameObj && gameId && !gameObj["gameOn"]) {
      const res = await fetch("/api/game/abortGame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengerInfo: gameObj.challengerInfo,
          acceptorInfo: gameObj.acceptorInfo,
        }),
      });
      const data = JSON.parse(JSON.stringify(await res.json()));
      if (res.status === 200) {
        const tempGameObj = gameObj;
        writeGameData(gameId, true, "/aborted");
        writeGameData(gameId, whoIm, "/abortedBy");
        writeGameData(gameId, true, "/gameOver");
      }
    }
  };

  const sendChat = async () => {
    if (chat && gameId && gameObj && whoIm) {
      const textChats = gameObj["textChats"];
      textChats.push({
        from: whoIm,
        message: chat,
      });
      writeGameData(gameId, textChats, "/textChats");
    }
  };

  const handleReady = async () => {
    if (gameId && gameObj && whoIm) {
      if (whoIm === "challenger" && !gameObj["challengerReady"]) {
        writeGameData(gameId, true, "/challengerReady");
      } else if (whoIm === "acceptor" && !gameObj["acceptorReady"]) {
        writeGameData(gameId, true, "/acceptorReady");
      }
    }
  };

  const testMove = () => {
    if (
      gameId &&
      gameObj &&
      gameObj["gameOn"] &&
      whoIm === "challenger" &&
      gameObj["challengerTimerOn"]
    ) {
      const TotalTimePlayedChallenger =
        gameObj["challengerTotalTimePlayed"] +
        (Date.now() - gameObj["timerTimeStamp"]);
      writeGameData(
        gameId,
        TotalTimePlayedChallenger,
        "/challengerTotalTimePlayed"
      );
      writeGameData(gameId, false, "/challengerTimerOn");
      writeGameData(gameId, true, "/acceptorTimerOn");
      writeGameData(gameId, Date.now(), "/timerTimeStamp");
    } else if (
      gameId &&
      gameObj &&
      gameObj["gameOn"] &&
      whoIm === "acceptor" &&
      gameObj["acceptorTimerOn"]
    ) {
      const TotalTimePlayedAcceptor =
        gameObj["acceptorTotalTimePlayed"] +
        (Date.now() - gameObj["timerTimeStamp"]);
      writeGameData(
        gameId,
        TotalTimePlayedAcceptor,
        "/acceptorTotalTimePlayed"
      );
      writeGameData(gameId, true, "/challengerTimerOn");
      writeGameData(gameId, false, "/acceptorTimerOn");
      writeGameData(gameId, Date.now(), "/timerTimeStamp");
    }
  };

  const onDrop = (sourceSquare, targetSquare, piece) => {
    if (gameId && gameObj && gameObj["gameOn"]) {
      chess.load(gameObj["latestMove"]["fen"]);
      if (chess.turn() === "w" && gameObj["white"] === whoIm) {
        try {
          chess.move({
            color: "w",
            from: sourceSquare,
            to: targetSquare,
            piece: piece,
            promotion: piece[1].toLowerCase(),
          });
          writeGameData(gameId, { by: whoIm, fen: chess.fen() }, "/latestMove");
          const temp = gameObj["moves"];
          temp.push({ by: whoIm, fen: chess.fen() });
          writeGameData(gameId, temp, "/moves");
          testMove();
          if (chess.isCheckmate()) {
            handleGameOver("checkmate");
          }
          if (chess.isDraw() || chess.isStalemate()) {
            handleGameOver("draw");
          }
        } catch (err) {}
      } else if (chess.turn() === "b" && gameObj["black"] === whoIm) {
        try {
          chess.move({
            color: "b",
            from: sourceSquare,
            to: targetSquare,
            piece: piece,
            promotion: piece[1].toLowerCase(),
          });
          writeGameData(gameId, { by: whoIm, fen: chess.fen() }, "/latestMove");
          const temp = gameObj["moves"];
          temp.push({ by: whoIm, fen: chess.fen() });
          writeGameData(gameId, temp, "/moves");
          testMove();
          if (chess.isCheckmate()) {
            handleGameOver("checkmate");
          }
          if (chess.isDraw() || chess.isStalemate()) {
            handleGameOver("draw");
          }
        } catch (err) {}
      } else {
        console.log("not ur turn");
      }
    }
  };

  const handleGetAgoraTokenAndJoinRoom = async () => {
    if (userInfo && gameObj) {
      const res = await fetch("/api/getAgoraToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userInfo["_id"],
          channelName: gameObj["gameId"],
        }),
      });
      const data = JSON.parse(JSON.stringify(await res.json()));
      if (res.status === 200) {
        const token = data["token"];
        let localTracks = [];
        const APP_ID = "98c5588fc2e0418d92c681bfebe81ac4";
        const client = AgoraRTC_N4190.createClient({
          mode: "rtc",
          codec: "vp8",
        });

        setClientObj(client);
        const handleUserJoined = async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "video") {
            user.videoTrack.play(`videoOppo`);
            setOpponentVideo(user.videoTrack);
          }
          if (mediaType === "audio") {
            user.audioTrack.play();
            setOpponentAudio(user.audioTrack);
          }
        };
        const handleUserLeft = async (user) => {
          console.log("opponent left video chat");
        };

        client.on("user-published", handleUserJoined);
        client.on("user-left", handleUserLeft);
        await client.join(APP_ID, gameObj["gameId"], token, userInfo["_id"]);
        localTracks = await AgoraRTC_N4190.createMicrophoneAndCameraTracks();
        setLocalStream(localTracks);
        localTracks[1].play(`videoMe`);
        await client.publish([localTracks[0], localTracks[1]]);
      }
    }
  };

  const leaveAndRemoveLocalStream = async () => {
    if (localStream && clientObj) {
      for (let i = 0; localStream.length > i; i++) {
        localStream[i].stop();
        localStream[i].close();
      }
      await clientObj.leave();
      setLocalStream(null);
      setClientObj(null);
      setOpponentAudio(null);
      setOpponentVideo(null);
    }
  };

  const handleToggleCamera = async (e) => {
    if (localStream) {
      if (localStream[1].muted) {
        await localStream[1].setMuted(false);
        e.target.innerText = "Camera on";
        e.target.style.backgroundColor = "cadetblue";
      } else {
        await localStream[1].setMuted(true);
        e.target.innerText = "Camera off";
        e.target.style.backgroundColor = "#EE4B2B";
      }
    }
  };

  let handleToggleMic = async (e) => {
    if (localStream) {
      if (localStream[0].muted) {
        await localStream[0].setMuted(false);
        e.target.innerText = "Mic on";
        e.target.style.backgroundColor = "cadetblue";
      } else {
        await localStream[0].setMuted(true);
        e.target.innerText = "Mic off";
        e.target.style.backgroundColor = "#EE4B2B";
      }
    }
  };

  const handleMuteVideoOpponent = async (e) => {
    if (opponentVideo) {
      if (opponentVideo["isPlaying"]) {
        await opponentVideo.stop();
        e.target.innerText = "Camera off";
        e.target.style.backgroundColor = "cadetblue";
      } else {
        await opponentVideo.play("videoOppo");
        e.target.innerText = "Camera on";
        e.target.style.backgroundColor = "#EE4B2B";
      }
    }
  };

  const handleMuteAudioOpponent = async (e) => {
    if (opponentAudio) {
      if (opponentAudio["isPlaying"]) {
        await opponentAudio.stop();
        e.target.innerText = "Mic off";
        e.target.style.backgroundColor = "cadetblue";
      } else {
        await opponentAudio.play();
        e.target.innerText = "Mic on";
        e.target.style.backgroundColor = "#EE4B2B";
      }
    }
  };

  return (
    gameId &&
    gameObj && (
      <>
        <div id="main" className="flex justify-between h-screen">
          <div
            id="gameControls"
            className=" bg-black bg-opacity-25 border h-[100] my-4 w-[22%] m-1 space-y-3 p-5 grid grid-cols-1 content-between"
          >
            <div id="c1">
              <h1>Game Controls</h1>
              {gameObj && (
                <div id="opponentInfo" className="my-3 space-y-3">
                  <span>
                    {whoIm === "challenger" ? "ACCEPTOR" : "CHALLENGER"}
                  </span>
                  <div
                    id="oppoInfo"
                    className=" flex items-center space-x-3 mx-1"
                  >
                    <Image
                      className="cursor-pointer rounded-full"
                      src={
                        (
                          whoIm === "challenger"
                            ? gameObj["acceptorInfo"]["profilePicUrl"]
                            : gameObj["challengerInfo"]["profilePicUrl"]
                        )
                          ? `/${
                              whoIm === "challenger"
                                ? gameObj["acceptorInfo"]["profilePicUrl"]
                                : gameObj["challengerInfo"]["profilePicUrl"]
                            }`
                          : "/dummyProfile.svg"
                      }
                      width={70}
                      height={70}
                      alt="logo"
                    />
                    <span>
                      {whoIm === "challenger"
                        ? gameObj["acceptorInfo"]["username"]
                        : gameObj["challengerInfo"]["username"]}
                    </span>
                  </div>
                  {whoIm === "acceptor" && (
                    <span>
                      Time Taken :{" "}
                      {gameObj &&
                        Math.floor(
                          gameObj["challengerTotalTimePlayed"] / 1000
                        ) + " sec"}
                    </span>
                  )}
                  {whoIm === "challenger" && (
                    <span>
                      Time Taken :{" "}
                      {gameObj &&
                        Math.floor(gameObj["acceptorTotalTimePlayed"] / 1000) +
                          " sec"}
                    </span>
                  )}
                  {gameObj &&
                    (!gameObj["challengerReady"] ||
                      !gameObj["acceptorReady"]) && (
                      <div className="flex flex-col space-y-1 p-1">
                        {whoIm === "acceptor" && (
                          <span>
                            {gameObj["challengerReady"]
                              ? "Opponent is Ready"
                              : "Opponent is not Ready"}
                          </span>
                        )}
                        {whoIm === "challenger" && (
                          <span>
                            {gameObj["acceptorReady"]
                              ? "Opponent is Ready"
                              : "Opponent is not Ready"}
                          </span>
                        )}
                      </div>
                    )}
                </div>
              )}
            </div>
            <div id="c2" className=" flex flex-col space-y-3">
              {gameObj &&
                gameObj["drawOfferedFrom"] !== "noone" &&
                gameObj["drawOfferedFrom"] !== whoIm && (
                  <div className=" flex flex-col">
                    <span className=" text-left">Draw Offered</span>
                    <div className=" flex justify-between">
                      <button
                        onClick={() => {
                          handleDrawResponse(true, false);
                        }}
                        id="acc"
                        className=" text-center border px-2 py-1 font-bold text-xl"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          handleDrawResponse(false, true);
                        }}
                        id="acc"
                        className=" text-center border px-2 py-1 font-bold text-xl"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              {gameObj &&
                gameObj["drawOfferedFrom"] !== "noone" &&
                gameObj["drawOfferedFrom"] === whoIm && (
                  <span>Draw request sent waiting for response</span>
                )}
              {gameObj &&
                (!gameObj["challengerReady"] || !gameObj["acceptorReady"]) && (
                  <div className="flex flex-col space-y-1 p-1">
                    {whoIm === "challenger" && (
                      <span>
                        {gameObj["challengerReady"]
                          ? "You are ready"
                          : "Click ready to start the game"}
                      </span>
                    )}
                    {whoIm === "acceptor" && (
                      <span>
                        {gameObj["acceptorReady"]
                          ? "You are ready"
                          : "Click ready to start the game"}
                      </span>
                    )}
                  </div>
                )}
              {(whoIm === "challenger"
                ? !gameObj["challengerReady"]
                : !gameObj["acceptorReady"]) && (
                <button
                  onClick={handleReady}
                  id="abortBtn"
                  className="px-7 py-1 border rounded-full w-1/3"
                >
                  Ready
                </button>
              )}
              {whoIm === "challenger" && (
                <span>
                  {gameObj && gameObj["challengerTimerOn"]
                    ? "Your Turn"
                    : "Waiting for Opponent's move"}
                </span>
              )}
              {whoIm === "acceptor" && (
                <span>
                  {gameObj && gameObj["acceptorTimerOn"]
                    ? "Your Turn"
                    : "Waiting for Opponent's move"}
                </span>
              )}

              {whoIm === "challenger" && (
                <span>
                  Time Taken :{" "}
                  {gameObj &&
                    Math.floor(gameObj["challengerTotalTimePlayed"] / 1000) +
                      " sec"}
                </span>
              )}
              {whoIm === "acceptor" && (
                <span>
                  Time Taken :{" "}
                  {gameObj &&
                    Math.floor(gameObj["acceptorTotalTimePlayed"] / 1000) +
                      " sec"}
                </span>
              )}
              <span>{whoIm.toUpperCase()}</span>
              <div id="myInfo" className=" flex items-center space-x-3 mx-1">
                <Image
                  className="cursor-pointer rounded-full"
                  src={
                    userInfo.profilePicUrl
                      ? `/${userInfo.profilePicUrl}`
                      : "/dummyProfile.svg"
                  }
                  width={70}
                  height={70}
                  alt="logo"
                />
                <span>{userInfo["username"]}</span>
              </div>
              <div id="btns" className="flex justify-between">
                <button
                  onClick={handleOfferDraw}
                  id="drawBtn"
                  className="px-7 py-1 border rounded-full"
                >
                  Draw
                </button>
                <button
                  onClick={() => {
                    handleGameOver("resign");
                  }}
                  id="resignBtn"
                  className="px-7 py-1 border rounded-full "
                >
                  Resign
                </button>
                <button
                  onClick={abortGame}
                  id="abortBtn"
                  className="px-7 py-1 border rounded-full"
                >
                  Abort
                </button>
              </div>
            </div>
          </div>
          <div
            id="Chessboard"
            className=" max-h-screen my-4 flex items-center w-[44%] m-1"
          >
            {!gameOver && (
              <Chessboard
                position={positionFenStr}
                onPieceDrop={onDrop}
                boardOrientation={
                  gameObj &&
                  gameObj["gameOn"] &&
                  (gameObj["white"] === whoIm ? "white" : "black")
                }
              />
            )}
            {gameOver && (
              <div className=" bg-white flex flex-col  text-black mx-auto h-[35vh] w-[40vh]  rounded-3xl p-5">
                <h1 className=" text-center font-bold text-2xl">Game Over</h1>
                <div
                  id="playersInfo"
                  className=" flex items-center h-[50%] justify-between"
                >
                  <div className=" flex flex-col items-center">
                    <Image
                      className="cursor-pointer rounded-full"
                      src={
                        userInfo.profilePicUrl
                          ? `/${userInfo.profilePicUrl}`
                          : "/dummyProfile.svg"
                      }
                      width={70}
                      height={70}
                      alt="logo"
                    />
                    <h1 className=" text-xl font-bold text-center">
                      {userInfo["username"]}
                    </h1>
                  </div>
                  <div className=" flex flex-col items-center">
                    <Image
                      className="cursor-pointer rounded-full"
                      src={
                        (
                          whoIm === "challenger"
                            ? gameObj["acceptorInfo"]["profilePicUrl"]
                            : gameObj["challengerInfo"]["profilePicUrl"]
                        )
                          ? `/${
                              whoIm === "challenger"
                                ? gameObj["acceptorInfo"]["profilePicUrl"]
                                : gameObj["challengerInfo"]["profilePicUrl"]
                            }`
                          : "/dummyProfile.svg"
                      }
                      width={70}
                      height={70}
                      alt="logo"
                    />
                    <h1 className=" text-xl font-bold text-center">
                      {whoIm === "challenger"
                        ? gameObj["acceptorInfo"]["username"]
                        : gameObj["challengerInfo"]["username"]}
                    </h1>
                  </div>
                </div>
                <div id="drawReason" className=" text-center font-bold text-xl">
                  {gameObj && gameObj["gameOver"] && gameObj["gameOverReason"]}
                </div>
                <div id="ratingGain" className="flex justify-between">
                  <div id="me" className=" w-1/2 text-center font-bold text-xl">
                    {gameObj &&
                      gameObj["gameOver"] &&
                      (whoIm === "challenger"
                        ? gameObj["changeInRatingOfChallenger"]
                        : gameObj["changeInRatingOfAcceptor"])}
                  </div>
                  <div
                    id="oppo"
                    className=" w-1/2 text-center font-bold text-xl"
                  >
                    {gameObj &&
                      gameObj["gameOver"] &&
                      (whoIm === "acceptor"
                        ? gameObj["changeInRatingOfChallenger"]
                        : gameObj["changeInRatingOfAcceptor"])}
                  </div>
                </div>
                <button
                  onClick={handleBackToHomePage}
                  className="text-center bg-blue-600 px-3 py-1 rounded-full font-bold text-xl"
                >
                  Back To Home Page
                </button>
              </div>
            )}
          </div>
          <div
            id="communications"
            className=" bg-black bg-opacity-25 border max-h-screen my-4 w-[32%] m-1"
          >
            <h1 className=" h-[5%]">Communications</h1>
            <div id="textChats" className="h-[30%]">
              <div id="input" className="h-[10%]">
                <input
                  onChange={(e) => {
                    setChat(e.target.value);
                  }}
                  type="text"
                  className=" bg-black text-white p-1 border m-1 w-[80%]"
                />
                <button
                  onClick={sendChat}
                  className=" m-1 border px-2 py-1 font-bold text-md"
                >
                  Send
                </button>
              </div>
              <div
                id="displayChat"
                className=" h-[90%] overflow-y-scroll overflow-x-hidden p-2"
              >
                {gameObj &&
                  gameObj["textChats"] &&
                  gameObj["textChats"].map((chat, index) => {
                    if (index === 0) return null;

                    let username = null;
                    if (chat["from"] === whoIm) {
                      if (whoIm === "challenger") {
                        username = gameObj["challengerInfo"]["username"];
                      } else {
                        username = gameObj["acceptorInfo"]["username"];
                      }
                    } else {
                      if (whoIm === "challenger") {
                        username = gameObj["acceptorInfo"]["username"];
                      } else {
                        username = gameObj["challengerInfo"]["username"];
                      }
                    }
                    return (
                      <div key={index} className=" flex space-x-2 ">
                        <div id="name" className=" font-bold text-sm">
                          {username + " :"}
                        </div>
                        <div id="name" className=" font-bold text-sm">
                          {chat["message"]}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div id="videoChat" className="h-[65%] p-3 flex flex-col space-y-2">
              <div id="me" className=" border h-[48%] w-full flex">
                <div className="w-[70%] h-full">
                  <h1 className=" text-lg font-bold h-[17%] p-1">Me</h1>
                  <div
                    id="videoMe"
                    className=" bg-black h-[83%] w-full  border"
                  ></div>
                </div>
                <div
                  id="videoContorlsMe"
                  className=" w-[30%] flex flex-col p-1 mt-auto"
                >
                  <button
                    onClick={handleGetAgoraTokenAndJoinRoom}
                    className=" border px-2 py-1  font-bold text-lg"
                    id="joinMe"
                  >
                    Join
                  </button>
                  <button
                    onClick={leaveAndRemoveLocalStream}
                    className=" border px-2 py-1  font-bold text-lg"
                    id="leaveMe"
                  >
                    Leave
                  </button>
                  <button
                    onClick={(e) => {
                      handleToggleCamera(e);
                    }}
                    className=" border px-2 py-1  font-bold text-lg"
                    id="cameraToggleMe"
                  >
                    Camera on
                  </button>
                  <button
                    className=" border px-2 py-1  font-bold text-lg"
                    id="micToggleMe"
                    onClick={(e) => {
                      handleToggleMic(e);
                    }}
                  >
                    Mic on
                  </button>
                </div>
              </div>
              <div id="oppo" className=" border h-[48%] w-full flex">
                <div className="w-[70%] h-full">
                  <h1 className=" text-lg font-bold h-[17%] p-1">Opponent</h1>
                  <div
                    id="videoOppo"
                    className=" bg-black h-[83%] w-full  border"
                  ></div>
                </div>
                <div
                  id="videoContorlsOppo"
                  className=" w-[30%] flex flex-col p-1 mt-auto"
                >
                  <button
                    onClick={(e) => {
                      handleMuteVideoOpponent(e);
                    }}
                    className=" border px-2 py-1  font-bold text-lg"
                    id="cameraToggleOppo"
                  >
                    Camera on
                  </button>
                  <button
                    onClick={(e) => {
                      handleMuteAudioOpponent(e);
                    }}
                    className=" border px-2 py-1  font-bold text-lg"
                    id="micToggleOppo"
                  >
                    Mic on
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
};
