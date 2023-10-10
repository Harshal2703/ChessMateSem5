import Image from "next/image";
import { useState } from "react";

export const SearchResult = ({ info, toast }) => {
  const addFriend = async () => {
    const res = await fetch("/api/addFriend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ friendToBeAdded: info }),
    });
    const data = JSON.parse(JSON.stringify(await res.json()));
    if (res.status === 200) {
      toast("request sent");
      console.log(data);
    }else{
        toast('failed to send request , try Again!')
    }
  };

  const sendChallenge = async () => {
    const res = await fetch("/api/sendChallenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ opponentInfo: info }),
      });
      const data = JSON.parse(JSON.stringify(await res.json()));
      if (res.status === 200) {
        toast("request sent");
        console.log(data);
      }else{
          toast(data.message)
      }
  };
  return (
    <div className="h-[15%] flex space-x-4 m-1 items-center">
      <Image
        className="rounded-full"
        src={
          info.profilePicUrl ? `/${info.profilePicUrl}` : "/dummyProfile.svg"
        }
        width={70}
        height={70}
        alt="logo"
        priority={true}
      />
      <span className="text-xl font-bold"> {info.username}</span>
      <button
        onClick={addFriend}
        className="bg-white text-black font-bold text-lg rounded-full px-3 py-1"
      >
        Add Friend
      </button>
      <button
        onClick={sendChallenge}
        className="bg-white text-black font-bold text-lg rounded-full px-3 py-1"
      >
        Send Challenge
      </button>
    </div>
  );
};
