"use client";
import Image from "next/image";
import { Chessboard } from "react-chessboard";
import { SearchResult } from "../MainPage/SearchResult";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Messages } from "./Messages";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const MainPageComp = () => {
  const [userDataFromServer, setUserDataFromServer] = useState(null);
  const [searchData, setSearchData] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [boardUi, setBoardUi] = useState(true);
  const [err, setErr] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/getInfo")
      .then((res) => {
        res
          .json()
          .then(({ data }) => {
            setUserDataFromServer(data);
          })
          .catch((err) => {
            router.redirect("/signin");
          });
      })
      .catch((err) => {
        router.redirect("/signin");
      });
  }, [router]);

  const handlePlayerSearch = async () => {
    if (searchData) {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ toSearch: searchData }),
      });
      const data = JSON.parse(JSON.stringify(await res.json()));
      if (res.status === 200) {
        setSearchResult(data.searchResult);
      } else {
        setErr("not found");
      }
    }
  };

  const clearPlayerSearch = async () => {
    setSearchResult("");
    setSearchData("");
  };

  const handleSignout = async () => {
    fetch("/api/auth/signout")
      .then(() => {
        router.push("/signin");
      })
      .catch((err) => {
        console.log("failed signing out try again");
      });
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {userDataFromServer && (
        <div className="flex">
          <div id="left" className="w-[20%]">
            <div id="logo" className="h-[10%]">
              <Image
                className="cursor-pointer mx-auto"
                src="/logo3.png"
                width={250}
                height={81}
                alt="logo"
                priority={true}
              />
            </div>
            <div id="rating" className="flex items-center p-5 h-[10%]">
              <svg
                className="w-10 h-10 text-yellow-300 mr-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
              </svg>
              <p className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
                1000
              </p>
            </div>
            <div
              id="d1"
              className="p-5 h-[80%] grid grid-cols-1 gap-0 content-between"
            >
              <div id="dm1" className="flex flex-col">
                <button
                  type="button"
                  className="text-black bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-bold rounded-lg text-xl px-5 py-2.5 text-center mr-2 mb-2"
                >
                  Play Online
                </button>
                <button
                  type="button"
                  className="text-black bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-bold rounded-lg text-xl px-5 py-2.5 text-center mr-2 mb-2"
                >
                  Play with Friend
                </button>
                <button
                  type="button"
                  className="text-black bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-bold rounded-lg text-xl px-5 py-2.5 text-center mr-2 mb-2"
                >
                  Play with Computer
                </button>
              </div>
              <div id="dm2" className="flex flex-col">
                <button
                  onClick={() => {
                    setBoardUi(false);
                  }}
                  type="button"
                  className="text-black bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-bold rounded-lg text-xl px-5 py-2.5 text-center mr-2 mb-2"
                >
                  Messages
                </button>
                <button
                  type="button"
                  className="text-black bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-bold rounded-lg text-xl px-5 py-2.5 text-center mr-2 mb-2"
                >
                  Profile
                </button>
                <button
                  type="button"
                  className="text-black bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-bold rounded-lg text-xl px-5 py-2.5 text-center mr-2 mb-2"
                >
                  Settings
                </button>
                <button
                  onClick={handleSignout}
                  type="button"
                  className="text-black bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-bold rounded-lg text-xl px-5 py-2.5 text-center mr-2 mb-2"
                >
                  Signout
                </button>
              </div>
            </div>
          </div>
          <div id="center" className="w-[46%] min-h-screen mx-auto p-2">
            {boardUi && (
              <Chessboard
                id="Dummy Board"
                position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 "
              />
            )}
            {!boardUi && (
              <Messages data={userDataFromServer} setBoardUi={setBoardUi} />
            )}
          </div>
          <div id="right" className="w-[34%] p-2 ">
            <div
              id="profileInfo"
              className="h-[12%] flex justify-end space-x-2 cursor-pointer"
            >
              <div
                id="username"
                className="text-center font-bold text-xl flex items-center h-[100%]"
              >
                <span>{userDataFromServer.username}</span>
              </div>
              <div id="profileImg">
                <Image
                  className="cursor-pointer mx-auto rounded-full"
                  src={
                    userDataFromServer.profilePicUrl
                      ? `/${userDataFromServer.profilePicUrl}`
                      : "/dummyProfile.svg"
                  }
                  width={70}
                  height={70}
                  alt="logo"
                />
              </div>
            </div>
            <div id="searchPlayer" className="h-[8%] my-2">
              <label
                htmlFor="default-search"
                className="mb-2 text-sm font-medium text-gray-900 sr-only"
              >
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  value={searchData}
                  type="search"
                  id="default-search"
                  className="block outline-none font-bold w-full p-4 pl-10 text-md rounded-lg bg-gray-50 dark:bg-gray-700 "
                  placeholder="Search Players Online..."
                  required
                  onChange={(event) => {
                    setSearchData(event.target.value);
                  }}
                />
                <div className="absolute right-2.5 bottom-2.5">
                  {searchData && (
                    <button
                      onClick={clearPlayerSearch}
                      type="button"
                      className="bg-white text-black rounded-full font-bold text-lg w-7 text-center m-1 font-mono ml-auto"
                    >
                      x
                    </button>
                  )}
                  <button
                    onClick={handlePlayerSearch}
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
            <div id="searchResults" className="max-h-[77vh] overflow-auto">
              {searchResult &&
                searchResult.map((data) => {
                  return <SearchResult key={data.username} toast={toast} info={data} />;
                })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
