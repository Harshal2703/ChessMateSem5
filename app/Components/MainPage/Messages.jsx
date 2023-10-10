import Image from "next/image";
import React, { useEffect, useState } from "react";

export const Messages = ({ data, setBoardUi }) => {
  const [requestsIn, setRequestsIn] = useState(null);
  useEffect(() => {
    setRequestsIn(data["requests-in"]);
  }, [data]);

  const handleRefresh = async () => {
    const res = await fetch("/api/getInfo");
    const data = (await res.json()).data
    console.log(data)
    setRequestsIn(data["requests-in"])
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
            {requestsIn &&
              requestsIn.length === 0 &&
              "Messages / Requests Appears here"}
          </h1>
          {requestsIn &&
            requestsIn.map((request) => {
              return (
                <div
                  key={request.reqId}
                  className="flex justify-between bg-black bg-opacity-50 font-bold border border-red-100 text-white p-3 my-3"
                >
                  <div className=" flex flex-col items-center space-x-2 space-y-3">
                    <h1 className="text-xl">
                      {request.reqType[0].toUpperCase() +
                        request.reqType.slice(1) +
                        " Request"}
                    </h1>
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
                    <button className="bg-white text-black px-3 py-1 rounded-full">
                      Accept
                    </button>
                    <button className="bg-white text-black px-3 py-1 rounded-full">
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};
