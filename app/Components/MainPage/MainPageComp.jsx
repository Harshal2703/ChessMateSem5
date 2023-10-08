"use client";
import Image from "next/image";
import { Chessboard } from "react-chessboard";

export const MainPageComp = () => {
  return (
    <div className="flex">
      <div id="leftCon" className="w-[25%]">
        <div id="logo">
          <Image
            className="cursor-pointer"
            src="/logo3.png"
            width={250}
            height={81}
            alt="Picture of the author"
          />
        </div>
        <div id="options" className="flex flex-col">
          <button className="text-left">Play 10 Minutes</button>
          <button className="text-left">Play a Friend</button>
          <button className="text-left">Play with Computer</button>
        </div>
        <div id="logout">
          <button>Logout</button>
        </div>
      </div>
      <div className="w-[46%] mx-auto p-2">
        <Chessboard
          id="Dummy Board"
          position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 "
        />
      </div>
      <div className="w-[25%]"></div>
    </div>
  );
};
