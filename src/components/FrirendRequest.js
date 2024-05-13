import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
  remove,
} from "firebase/database";
import { useSelector } from "react-redux";

const FrirendRequest = () => {
  const db = getDatabase();
  let data = useSelector((state) => state.userLoginInfo.userInfo);
  let [friendrequest, setFriendrequest] = useState([]);

  useEffect(() => {
    const friendrequestRef = ref(db, "friendrequest");
    onValue(friendrequestRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        if (item.val().recieverid == data.uid) {
          arr.push({ ...item.val(), id: item.key });
        }
      });
      setFriendrequest(arr);
    });
  }, []);

  let handleAccept = (item) => {
    set(push(ref(db, "friend")), {
      ...item,
    }).then(remove(ref(db, "friendrequest/" + item.id)));
  };
  let handleDelete = (item) => {
    remove(ref(db, "friendrequest/" + item.id));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full border border-solid border-black border-opacity-5 py-3 mt-11 px-6 pb-5 h-[400px] overflow-y-auto">
      <h3 className="font-poppins text-xl font-semibold">Friend Request</h3>
      <div className="relative">
        <BsThreeDotsVertical className="text-lg text-primary absolute top-[-16px] right-[7px]" />
      </div>
      {friendrequest.length == 0 ?
        <div className="flex justify-center items-center h-full">
        <h1 className="font-nunito font-bold text-xl text-black">No friend request available</h1>
      </div>
      :
      friendrequest.map((item) => (
        <div className="flex relative mt-4 pt-5">
          <img
            className="w-[70px] h-[70px] rounded-full mt-0.5"
            src={item.senderPhoto}
          />
          <div className="pl-7 pt-1.5 after:w-[400px] after:h-px after:bottom-[-18px] after:left-[-10px] after:content-[''] after:absolute after:bg-[#BFBFBF]">
            <h3 className="font-poppins font-bold pl-1 text-lg">
              {item.sendername}
            </h3>
            <div className="mt-2">
              <button
                onClick={() => handleAccept(item)}
                className="font-poppins font-semibold text-xl bg-themes duration-100 text-white px-6 py-1.5 rounded-xl"
              >
                Accept
              </button>
              <button
                onClick={() => handleDelete(item)}
                className="font-poppins font-semibold text-xl ml-2 bg-red-600 duration-100 text-white px-6 py-1.5 rounded-xl hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))
      }
    </div>
  );
};

export default FrirendRequest;
