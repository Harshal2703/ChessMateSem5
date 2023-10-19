import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const Friends = ({ setBoardUi, setFriendUi, setMessagesUi }) => {
  const [friends, setFriends] = useState(null);
  useEffect(() => {
    fetch("/api/getInfo").then((res) => {
      res.json().then(({ data }) => {
        const temp = data.friends.filter((friend) => {
          return friend.accepted === true;
        });
        setFriends(temp);
      });
    });
  }, []);

  const handleRefresh = async () => {
    const res = await fetch("/api/getInfo");
    const dataRef = (await res.json()).data;
    const temp = dataRef.friends.filter((friend) => {
      return friend.accepted === true;
    });
    setFriends(temp);
  };

  const handleRemoveFriend = async (friend) => {
    const res = await fetch("/api/removeFriend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(friend),
    });
    const data = JSON.parse(JSON.stringify(await res.json()));
    if (res.status === 200) {
      toast("removed successfully");
      handleRefresh();
    }
  };

  const sendChallenge = async (opponentInfo) => {
    const res = await fetch("/api/sendChallenge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ opponentInfo }),
    });
    const data = JSON.parse(JSON.stringify(await res.json()));
    if (res.status === 200) {
      toast("request sent");
    } else {
      toast(data.message);
    }
  };
  return (
    <div id="messages" className="max-h-[97vh]">
      <div id="head" className="flex justify-between p-3 sticky top-0">
        <h1 className=" text-5xl text-white font-bold">Friends</h1>
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
          {friends && friends.length === 0 && "Friends Details appears here"}
        </h1>
        {friends &&
          friends.map((friend) => {
            return (
              <div
                key={friend.reqId}
                className="flex justify-between bg-black bg-opacity-50 font-bold border border-red-100 text-white p-3 my-3"
              >
                <div className=" flex flex-col items-center space-x-2 space-y-3">
                  <div className="flex items-center space-x-3 cursor-pointer">
                    <Image
                      className="rounded-full"
                      src={
                        friend.profilePicUrl
                          ? `/${friend.profilePicUrl}`
                          : "/dummyProfile.svg"
                      }
                      width={70}
                      height={70}
                      alt="logo"
                    />
                    <span className="text-center">{friend.username}</span>
                  </div>
                </div>
                <div className=" text-white text-left font-bold space-x-4 flex items-center">
                  <button
                    onClick={() => {
                      sendChallenge(friend);
                    }}
                    className="bg-white text-black px-3 py-1 rounded-full"
                  >
                    Send Challenge
                  </button>
                  <button
                    onClick={() => {
                      handleRemoveFriend(friend);
                    }}
                    className="bg-white text-black px-3 py-1 rounded-full"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
