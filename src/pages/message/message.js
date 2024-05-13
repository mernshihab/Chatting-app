import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Sidebar from "../../components/Sidebar";
import Search from "../../components/Search";
import MsgFriendlist from "../../components/MsgFriendlist";
import MsgGroups from "../../components/MsgGroups";
import { useNavigate } from "react-router-dom";
import Chat from "../../components/Chat";

const Message = () => {
  let navigate = useNavigate();
  let data = useSelector((state) => state.userLoginInfo.userInfo);

  useEffect(() => {
    if (!data) {
      navigate("/login");
    }
  }, []);

  return (
    <>
      {data && (
        <div className="flex  justify-evenly">
          <>
            <div className="w-[200px]">
              <Sidebar active="message" />
            </div>
            <div className="w-1/4 space-y-4">
              <Search />
              <MsgFriendlist />
              <MsgGroups />
            </div>
            <div className="w-[1000px]">
              <Chat/>
            </div>
          </>
        </div>
      )}
    </>
  );
};

export default Message;
