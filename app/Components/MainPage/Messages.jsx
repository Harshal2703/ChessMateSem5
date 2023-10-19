import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const Messages = ({ setBoardUi, setFriendUi, setMessagesUi,router }) => {
  const [friendRequests, setFriendRequests] = useState(null);
  const [challenges, setChallenges] = useState(null);
  useEffect(() => {
    fetch("/api/getInfo").then((res) => {
      res.json().then(({ data }) => {
        setChallenges(data.challenges);
        const temp = data.friends.filter((friend) => {
          return friend.accepted === false;
        });
        setFriendRequests(temp);
      });
    });
  }, []);

  const handleRefresh = async () => {
    const res = await fetch("/api/getInfo");
    const dataRef = (await res.json()).data;
    setChallenges(dataRef.challenges);
    if(dataRef["active-game"]){
      router.push("/game")
    }
    const temp = dataRef.friends.filter((friend) => {
      return friend.accepted === false;
    });
    setFriendRequests(temp);
  };

  const handleAck = async (reqId, acc, rej) => {
    const res = await fetch("/api/acceptRejectFriendRequests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reqId, acc, rej }),
    });
    const data = JSON.parse(JSON.stringify(await res.json()));
    if (res.status === 200) {
      toast("added successfully");
      handleRefresh();
    }
  };

  const challengeAck = async (challenge, acc, rej) => {
    const res = await fetch("/api/acceptRejectChallenges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reqId: challenge.reqId, acc, rej }),
    });
    const data = JSON.parse(JSON.stringify(await res.json()));
    if (res.status === 200) {
      if(acc)
      router.push('/game')
      toast("added successfully");
      handleRefresh();
    }
  };

  return (
    <>
      <div id="messages" className="max-h-[97vh]">
        <div id="head" className="flex justify-between p-3 sticky top-0">
          <h1 className=" text-5xl text-white font-bold">Messages</h1>
          <div>
            <button
              onClick={handleRefresh}
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                setBoardUi(true);
                setFriendUi(false);
                setMessagesUi(false);
              }}
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Back
            </button>
          </div>
        </div>
        <div id="body" className=" p-3 max-h-[86vh] overflow-auto">
          <h1>
            {friendRequests &&
              friendRequests.length === 0 &&
              challenges &&
              challenges.length === 0 &&
              "Messages / Requests Appears here"}
          </h1>
          {challenges &&
            challenges.map((challenge) => {
              return (
                <div key={challenge.reqId} className="my-3 space-y-1">
                  <h1 className="bg-black inline p-1 bg-opacity-50 font-bold border border-red-100 text-white">
                    Challenge
                  </h1>
                  <div className="flex justify-between bg-black bg-opacity-50 font-bold border border-red-100 text-white p-3">
                    <div className=" flex flex-col items-center space-x-2 space-y-3">
                      <div className="flex items-center space-x-3 cursor-pointer">
                        <Image
                          className="rounded-full"
                          src={
                            challenge.profilePicUrl
                              ? `/${challenge.profilePicUrl}`
                              : "/dummyProfile.svg"
                          }
                          width={70}
                          height={70}
                          alt="logo"
                        />
                        <span className="text-center">
                          {challenge.username}
                        </span>
                      </div>
                    </div>
                    {!challenge.challenger && (
                      <div className=" text-white text-left font-bold space-x-4 flex items-center">
                        <button
                          onClick={() => {
                            challengeAck(challenge, true, false);
                          }}
                          className="bg-white text-black px-3 py-1 rounded-full"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            challengeAck(challenge, false, true);
                          }}
                          className="bg-white text-black px-3 py-1 rounded-full"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {challenge.challenger && (
                      <div className=" text-white text-left font-bold space-x-4 flex items-center">
                        Waiting for response
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          {friendRequests &&
            friendRequests.map((request) => {
              return (
                <div key={request.reqId} className="my-3 space-y-1">
                  <h1 className="bg-black inline p-1 bg-opacity-50 font-bold border border-red-100 text-white">
                    Friend Request
                  </h1>
                  <div className="flex justify-between bg-black bg-opacity-50 font-bold border border-red-100 text-white p-3">
                    <div className=" flex flex-col items-center space-x-2 space-y-3">
                      <div className="flex items-center space-x-3 cursor-pointer">
                        <Image
                          className="rounded-full"
                          src={
                            request.profilePicUrl
                              ? `/${request.profilePicUrl}`
                              : "/dummyProfile.svg"
                          }
                          width={70}
                          height={70}
                          alt="logo"
                        />
                        <span className="text-center">{request.username}</span>
                      </div>
                    </div>
                    <div className=" text-white text-left font-bold space-x-4 flex items-center">
                      <button
                        onClick={() => {
                          handleAck(request.reqId, true, false);
                        }}
                        className="bg-white text-black px-3 py-1 rounded-full"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          handleAck(request.reqId, false, true);
                        }}
                        className="bg-white text-black px-3 py-1 rounded-full"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};
