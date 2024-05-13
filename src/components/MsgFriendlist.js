import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  getDatabase,
  set,
  ref,
  onValue,
  push,
  remove,
} from "firebase/database";
import { useSelector, useDispatch } from "react-redux";
import { activeChat } from "../slices/activeChatSlice";
import { json } from "react-router-dom";

const MsgFriendlist = () => {
  const db = getDatabase();
  let data = useSelector((state) => state.userLoginInfo.userInfo);
  let dispatch = useDispatch();
  let [friendlist, setFriendList] = useState([]);

  let handleBlock = (item) => {
    if (data.uid === item.senderid) {
      set(push(ref(db, "blocklist")), {
        blockid: item.recieverid,
        blockidname: item.recievername,
        blockidPhoto: item.recieverPhoto,
        blockbyid: item.senderid,
        blockbyidname: item.sendername,
        blockbyidPhoto: item.senderPhoto,
      }).then(() => {
        remove(ref(db, "friend/" + item.key));
      });
    } else {
      set(push(ref(db, "blocklist")), {
        blockid: item.senderid,
        blockidname: item.sendername,
        blockidPhoto: item.senderPhoto,
        blockbyid: item.recieverid,
        blockbyidname: item.recievername,
        blockbyidPhoto: item.recieverPhoto,
      }).then(() => {
        remove(ref(db, "friend/" + item.key));
      });
    }
  };

  let handleActiveChat = (item) => {
    if (item.recieverid == data.uid) {
      dispatch(
        activeChat({
          status: "single",
          id: item.senderid,
          name: item.sendername,
          photo: item.senderPhoto,
        })
      );
      localStorage.setItem(
        "activeChat",
        JSON.stringify({ id: item.senderid, name: item.sendername, photo: item.senderPhoto })
      );
    } else {
      dispatch(
        activeChat({
          status: "single",
          id: item.recieverid,
          name: item.recievername,
          photo: item.recieverPhoto,
        })
      );
      localStorage.setItem(
        "activeChat",
        JSON.stringify({ id: item.recieverid, name: item.recievername , photo: item.recieverPhoto})
      );
    }
  };

  useEffect(() => {
    const friendRef = ref(db, "friend");
    onValue(friendRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        if (
          data.uid === item.val().recieverid ||
          data.uid === item.val().senderid
        ) {
          arr.push({ ...item.val(), key: item.key });
        }
      });
      setFriendList(arr);
    });
  }, [data.uid, db]);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-solid border-black border-opacity-5 w-full py-3 px-6 pb-5 h-[463px] mr-10 overflow-y-auto">
      <h3 className="font-poppins text-xl font-semibold">Friends</h3>
      <div className="relative">
        <BsThreeDotsVertical className="text-lg text-primary absolute top-[-16px] right-[7px]" />
      </div>
      {friendlist.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <h1 className="font-nunito font-bold text-xl text-black">
            No friends available
          </h1>
        </div>
      ) : (
        friendlist.map((item) => (
          <div
            onClick={() => handleActiveChat(item)}
            className="flex mt-4 pt-5"
          >
            <img
              className="w-[70px] h-[70px] rounded-full mt-0.5"
              alt=""
              src={
                item.senderPhoto === data.photoURL
                  ? item.recieverPhoto
                  : item.senderPhoto
              }
            />
            <div className="pl-6">
              <h3 className="font-poppins font-bold pl-1 text-lg">
                {data.uid === item.senderid
                  ? item.recievername
                  : item.sendername}
              </h3>
              <div className="mt-1.5 after:w-[380px] after:h-px after:bottom-[-18px] after:left-[-70px] after:content-[''] relative after:absolute after:bg-[#BFBFBF]">
                <button className="font-poppins font-semibold text-xl bg-green-600 duration-100 text-white px-6 py-1.5 rounded-xl">
                  Message
                </button>
                <button
                  onClick={() => handleBlock(item)}
                  className="font-poppins font-semibold text-xl ml-2 bg-red-600 duration-100 text-white px-6 py-1.5 rounded-xl hover:bg-red-600"
                >
                  Block
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MsgFriendlist;
