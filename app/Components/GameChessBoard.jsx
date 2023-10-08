"use client";
import { useState } from "react";
import Chess from "chess.js";
import { Chessboard } from "react-chessboard";

const GameChessBoard = () => {
  const test = (source, target) => {
    console.log(source, target);
  };
  return (
    <div className="w-[46%] mx-auto p-2">
      <Chessboard
        customDarkSquareStyle={{ backgroundColor: "#B58863" }}
        id="BasicBoard"
        onPieceDrop={test}
        position="rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"
      />
    </div>
  );
};

export default ChessBoard;
