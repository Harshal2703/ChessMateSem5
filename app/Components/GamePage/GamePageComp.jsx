"use client";
import Image from "next/image";
import { Chessboard } from "react-chessboard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import {} from "../../../firbaseConfig";
import { getDatabase, ref, set, onValue } from "firebase/database";

export const GamePageComp = () => {
  const [gameId, setGameId] = useState(null);
  const [gameObj, setGameObj] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [whoIm, setWhoIm] = useState(null);
  const [chat, setChat] = useState(null);

  const router = useRouter();
  useEffect(() => {
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
              if (rtdata["challengerInfo"]["email"] === data["email"]) {
                setWhoIm("challenger");
              } else {
                setWhoIm("acceptor");
              }
              if (rtdata["aborted"]) {
                router.push("/");
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
    const res = await fetch("/api/game/abortGame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameId, abortedBy: whoIm }),
    });
    const data = JSON.parse(JSON.stringify(await res.json()));
    if (res.status === 200) {
      router.push("/");
    }
  };

  async function writeGameData(gameId, updatePayload) {
    const db = getDatabase();
    await set(ref(db, "games/" + gameId), updatePayload);
  }

  const sendChat = async () => {
    if (chat && gameId && gameObj && whoIm) {
      const tempGameObj = gameObj;
      tempGameObj["textChats"].push({
        from: whoIm,
        message: chat,
      });
      writeGameData(gameId, tempGameObj);
    }
  };

  return (
    gameId &&
    gameObj && (
      <div id="main" className="flex justify-between h-screen">
        <div
          id="gameControls"
          className=" bg-black bg-opacity-25 border max-h-screen my-4 w-[25%] m-1"
        >
          <h1>Game Controls</h1>
          <button
            onClick={abortGame}
            id="abortBtn"
            className="px-7 py-1 border rounded-full"
          >
            Abort
          </button>
        </div>
        <div
          id="Chessboard"
          className=" bg-black bg-opacity-25 border max-h-screen my-4 w-[50%] m-1"
        >
          Chessboard
        </div>
        <div
          id="communications"
          className=" bg-black bg-opacity-25 border max-h-screen my-4 w-[25%] m-1"
        >
          <h1>Communications</h1>
          <div id="textChats" className="h-[50%]">
            <div id="input" className="h-[10%]">
              <input
                onChange={(e) => {
                  setChat(e.target.value);
                }}
                type="text"
                className=" bg-black text-white p-1 border m-1 w-[80%]"
              />
              <button onClick={sendChat}>Send</button>
            </div>
            <div
              id="displayChat"
              className=" h-[90%] overflow-y-scroll overflow-x-hidden"
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
                    <div key={index} className=" flex space-x-2">
                      <div id="name">{username}</div>
                      <div id="name">{chat["message"]}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

// {
//   gameId,
//   challengerInfo: {
//       "email": serverInfoOfOpponent.email,
//       "username": serverInfoOfOpponent.username,
//       "rating": serverInfoOfOpponent.rating,
//       "profilePicUrl": serverInfoOfOpponent.profilePicUrl
//   },
//   acceptorInfo: {
//       "email": serverInfoOfUser.email,
//       "username": serverInfoOfUser.username,
//       "rating": serverInfoOfUser.rating,
//       "profilePicUrl": serverInfoOfUser.profilePicUrl
//   },
//   challengerReady: false,
//   acceptorReady: false,
//   black:null,
//   white:null,
//   gameOn: false,
//   gameOver: false,
//   aborted: false,
//   abortedFrom:null,
//   draw: false,
//   drawOfferedFrom:null,
//   drawAccepted:false,
//   whoWon: null,
//   resigned: false,
//   resignedBy: null,
//   gameOverReason: null,
//   textChats: [], // {"from":"abc" , "message":"hi"}
//   videoChat: {}, // to be decided
//   moves: [],  // fen strings
// }
