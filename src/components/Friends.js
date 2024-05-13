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
import { useSelector } from "react-redux";

const Friends = () => {
  const db = getDatabase();
  let data = useSelector((state) => state.userLoginInfo.userInfo);
  let [friendlist, setFriendList] = useState([]);

  let handleUnfriend = (item) => {
    remove(ref(db, "friend/" + item.key));
    console.log(item.key);
  };

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
    <div className="bg-white rounded-3xl shadow-xl border border-solid border-black border-opacity-5 w-full py-3 px-6 pb-5 h-[463px] mr-10 overflow-y-scroll">
      <h3 className="font-poppins text-xl font-semibold">Friends</h3>
      <div className="relative">
        <BsThreeDotsVertical className="text-lg text-primary absolute top-[-16px] right-[7px]" />
      </div>
      {friendlist.length === 0 ?
        <div className="flex justify-center items-center h-full">
        <h1 className="font-nunito font-bold text-xl text-black">No friends available</h1>
      </div>
      :
      friendlist.map((item) => (
        <div className="flex mt-4 pt-5">
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
              {data.uid === item.senderid ? item.recievername : item.sendername}
            </h3>
            <div className="mt-1.5 after:w-[380px] after:h-px after:bottom-[-18px] after:left-[-70px] after:content-[''] relative after:absolute after:bg-[#BFBFBF]">
              <button
                onClick={() => handleUnfriend(item)}
                className="font-poppins font-semibold text-xl bg-teal-600 duration-100 text-white px-6 py-1.5 rounded-xl"
              >
                Unfriend
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
      }
    </div>
  );
};

export default Friends;
