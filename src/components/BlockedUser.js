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

const BlockedUser = () => {
  const db = getDatabase();
  let data = useSelector((state) => state.userLoginInfo.userInfo);
  let [blocklist, setBlockList] = useState([]);

  useEffect(() => {
    const blockRef = ref(db, "blocklist");
    onValue(blockRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        if (data.uid === item.val().blockbyid) {
          arr.push({ ...item.val(), key: item.key });
        }
      });
      setBlockList(arr);
    });
  }, [data.uid, db]);

  let handleUnblock = (item) => {
    set(push(ref(db, "friend/")), {
      sendername: item.blockidname,
      senderid: item.blockid,
      senderPhoto: item.blockidPhoto,
      recievername: data.displayName,
      recieverid: data.uid,
      recieverPhoto: data.photoURL,
    }).then(() => {
      remove(ref(db, "blocklist/" + item.key));
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-solid border-black border-opacity-5 w-full py-3 mt-11 px-6 pb-5 h-[400px] overflow-y-auto">
      <h3 className="font-poppins text-xl font-semibold">Blocked List</h3>
      <div className="relative">
        <BsThreeDotsVertical className="text-lg text-primary absolute top-[-16px] right-[7px]" />
      </div>
      {blocklist.length === 0 ?
        <div className="flex justify-center items-center h-full">
        <h1 className="font-nunito font-bold text-xl text-black">No blocked person available</h1>
      </div>
      :
      blocklist.map((item) => (
        <div className="flex mt-4 pt-5">
          <img
            className="w-[60px] h-[60px] rounded-full mt-0.5"
            src={item.blockidPhoto}
            alt="blockidPhoto"
          />
          <div className="pl-6 w-[190px] pt-1.5">
            <h3 className="font-poppins font-bold text-lg">
              {item.blockidname}
            </h3>
          </div>
          <div className="ml-4 mt-3 after:w-[380px] after:h-px after:bottom-[-18px] after:left-[-245px] after:content-[''] relative after:absolute after:bg-[#BFBFBF]">
            <button
              onClick={() => handleUnblock(item)}
              className="font-poppins font-semibold text-xl bg-red-600 hover:py-2 hover:px-5 duration-100 text-white px-4 py-1.5 hover:mt-[-2px] hover:ml-[-2px] rounded-xl hover:bg-themes"
            >
              Unblock
            </button>
          </div>
        </div>
      ))
      }
    </div>
  );
};

export default BlockedUser;
