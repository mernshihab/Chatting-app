import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { useSelector, useDispatch } from "react-redux";
import { AiFillMessage } from "react-icons/ai";
import { activeChat } from "../slices/activeChatSlice";

const MsgGroups = () => {
  const db = getDatabase();
  const dispatch = useDispatch();
  let data = useSelector((state) => state.userLoginInfo.userInfo);
  let [show, setShow] = useState(false);
  let [groupName, setGroupName] = useState("");
  let [groupTag, setGroupTag] = useState("");
  let [groups, setGroups] = useState([]);
  let [groupPending, setGroupPending] = useState([]);

  let handleGroupRequest = (item) => {
    set(push(ref(db, "groupRequest")), {
      adminId: item.adminId,
      adminName: item.adminName,
      groupId: item.key,
      groupName: item.groupName,
      groupTag: item.groupTag,
      userId: data.uid,
      userName: data.displayName,
      userPhoto: data.photoURL,
    });
  };

  let handleGroupChat = (item) => {
    dispatch(
      activeChat({
        status: "group",
        id: item.key,
        name: item.groupName,
        photo: item.groupImg,
        adminName: item.adminName,
        adminId: item.adminId,
      })
    );
  };

  useEffect(() => {
    const groupRef = ref(db, "group");
    onValue(groupRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        arr.push({ ...item.val(), key: item.key });
      });
      setGroups(arr);
    });

    const groupRequestRef = ref(db, "groupRequest");
    onValue(groupRequestRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        arr.push(item.val().groupId + item.val().userId);
      });
      setGroupPending(arr);
    });
  }, [data.uid, db]);

  return (
    <div className="bg-white rounded-3xl border border-solid border-black border-opacity-5 shadow-xl w-full py-3 mt-11 px-6 pb-5 h-[360px] overflow-y-auto">
      <div className="flex justify-between mb-5">
        <h3 className="font-poppins text-xl font-semibold">Group List</h3>
      </div>
      {groups.length == 0 ? (
        <div className="flex justify-center items-center h-full">
          <h1 className="font-nunito font-bold text-xl text-black">
            No groups available
          </h1>
        </div>
      ) : (
        groups.map((item) => (
          <div
            onClick={() => handleGroupChat(item)}
            className="flex justify-between mt-4 pt-5 w-full relative after:w-[400px] after:h-px after:bottom-[-13px] after:left-1 after:content-['']  after:absolute after:bg-[#BFBFBF]"
          >
            <div className="flex">
              <img
                className="w-[70px] h-[70px] rounded-full"
                src={item.groupImg || "images/groupimg.png"}
                alt=""
              />
              <div className="ml-6 mt-2">
                <h5 className="font-poppins font-regular text-[#797979] text-base">
                  Admin:{item.adminName}
                </h5>
                <h3 className="font-poppins tracking-wider font-bold text-lg">
                  {item.groupName}
                  {/* {item.key} */}
                </h3>
                <h5 className="font-poppins font-medium text-[#797979] text-sm">
                  {item.groupTag}
                </h5>
              </div>
            </div>
            <div className="mr-1 mt-4">
              <button
                onClick={() => handleGroupRequest(item)}
                className="font-poppins font-semibold text-xl text-white px-5 py-2 rounded-md bg-primary"
              >
                <AiFillMessage />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MsgGroups;
