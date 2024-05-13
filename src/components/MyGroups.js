import React, { useEffect, useState } from "react";
import { TbArrowBackUp } from "react-icons/tb";
import {
  getDatabase,
  set,
  ref,
  onValue,
  push,
  remove,
} from "firebase/database";
import { useSelector } from "react-redux";

const MyGroups = () => {
  const db = getDatabase();
  let data = useSelector((state) => state.userLoginInfo.userInfo);
  let [deletePop, setDeletePop] = useState(false);
  let [show, setShow] = useState(false);
  let [memberShow, setMemberShow] = useState(false);

  let [myGroups, setMyGroups] = useState([]);
  let [groupRequest, setGroupRequest] = useState([]);
  let [groupMembers, setGroupMembers] = useState([]);

  let handleGroupDelete = (item) => {
    remove(ref(db, "group/" + item.key));
    setDeletePop(false);
  };

  let handleReqShow = (gitem) => {
    setShow(!show);
    const groupRequestRef = ref(db, "groupRequest");
    onValue(groupRequestRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        if (
          data.uid == item.val().adminId &&
          item.val().groupId === gitem.key
        ) {
          arr.push({ ...item.val(), key: item.key });
        }
      });
      setGroupRequest(arr);
    });
  };

  let handleReject = (item) => {
    remove(ref(db, "groupRequest/" + item.key));
  };

  let handleAccept = (item) => {
    set(push(ref(db, "groupMember")), {
      adminId: item.adminId,
      adminName: item.adminName,
      groupId: item.groupId,
      groupName: item.groupName,
      groupTag: item.groupTag,
      memberId: item.userId,
      memberName: item.userName,
      memberPhoto: item.userPhoto,
    }).then(remove(ref(db, "groupRequest/" + item.key)));
  };

  let handleInfo = (gitem) => {
    const memberRef = ref(db, "groupMember");
    onValue(memberRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        if (data.uid === gitem.adminId && gitem.key === item.val().groupId) {
          arr.push({ ...item.val(), key: item.key });
        }
      });
      setGroupMembers(arr);
    });
    setMemberShow(!memberShow);
  };

  useEffect(() => {
    const groupRef = ref(db, "group");
    onValue(groupRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        if (data.uid == item.val().adminId) {
          arr.push({ ...item.val(), key: item.key });
        }
      });
      setMyGroups(arr);
    });
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-solid border-black border-opacity-5 w-full py-3 px-6 pb-5 h-[400px] mt-11 overflow-y-auto">
      <h3 className="font-poppins text-xl font-semibold">My Groups</h3>
      <div className="relative">
        {show && (
          <button
            onClick={() => setShow(!show)}
            className="font-poppins font-semibold text-xl text-white px-3 py-1 rounded-md bg-primary absolute top-[-20px] right-0"
          >
            Go Back
          </button>
        )}
        {memberShow && (
          <>
            <button
              onClick={() => setDeletePop(!deletePop)}
              className="font-poppins font-semibold text-xl text-white px-4 py-1 mb-1 rounded-md bg-red-600 absolute top-[-20px] right-16"
            >
              Delete
            </button>
            <button
              onClick={() => setMemberShow(!memberShow)}
              className="font-poppins font-semibold text-xl text-white px-3 py-2 rounded-md bg-primary absolute top-[-20px] right-2"
            >
              <TbArrowBackUp />
            </button>
          </>
        )}
      </div>
      {myGroups.length == 0 ? (
        <div className="flex justify-center items-center h-full">
          <h1 className="font-nunito font-bold text-xl text-black">
            No groups available
          </h1>
        </div>
      ) : show ? (
        groupRequest.map((item) => (
          <div className="flex justify-between mt-4 pt-5 w-full relative after:w-[410px] after:h-px after:bottom-[-13px] after:left-2 after:content-['']  after:absolute after:bg-[#BFBFBF]">
            <div className="flex">
              <img
                className="w-[80px] h-[80px] rounded-full"
                src={item.userPhoto}
                alt=""
              />
              <div className="ml-6 mt-2">
                <h3 className="font-poppins font-bold text-lg">
                  {item.userName}
                </h3>
                <h5 className="font-poppins font-medium text-[#797979] text-sm">
                  {item.groupTag}
                </h5>
              </div>
            </div>

            <div
              className="ml-14 mt-3 flex flex-col"
              onClick={() => handleAccept(item)}
            >
              <button className="font-poppins font-semibold text-xl mb-2 text-white px-2 py-1.5 rounded-md bg-green-600">
                Accept
              </button>
              <button
                onClick={() => handleReject(item)}
                className="font-poppins font-semibold text-xl text-white px-4 py-1 mb-1 rounded-md bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      ) : memberShow ? (
        groupMembers.map((item) => (
          <>
            <div className="flex justify-between mt-4 pt-5 w-full relative after:w-[410px] after:h-px after:bottom-[-13px] after:left-2 after:content-['']  after:absolute after:bg-[#BFBFBF] ">
              <div className="flex">
                <img
                  className="w-[90px] h-[90px] rounded-full"
                  src={item.memberPhoto}
                  alt=""
                />
                <div className="ml-6 mt-2">
                  <h3 className="font-poppins font-bold text-2xl flex items-center h-full">
                    {item.memberName}
                  </h3>
                </div>
              </div>
              {deletePop && (
                <div className="w-full p-4 z-20 absolute flex flex-col items-center justify-center top-3 opacity-95 shadow-md left-0 rounded-md bg-gray-600">
                  <h2 className="font-poppins font-bold text-lg tracking-wider text-white">
                    Are you sure?
                  </h2>
                  <div className="mt-2.5">
                    <button
                      onClick={() => setDeletePop(!deletePop)}
                      className="font-poppins font-semibold text-lg text-white px-3 bg-green-500 rounded-md mr-4"
                    >
                      no
                    </button>
                    <button
                      onClick={() => handleGroupDelete(item)}
                      className="font-poppins font-semibold text-lg text-white px-3 bg-red-600 rounded-md"
                    >
                      Yes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ))
      ) : (
        myGroups.map((item) => (
          <div className="flex justify-between mt-4 pt-5 w-full relative after:w-[410px] after:h-px after:bottom-[-13px] after:left-2 after:content-['']  after:absolute after:bg-[#BFBFBF]">
            <div className="flex">
              <img className="w-[70px] h-[70px] rounded-full" src={item.groupImg ? item.groupImg : "images/groupimg.png"} alt="" />
              <div className="ml-6 mt-2">
                <h5 className="font-poppins font-medium text-[#797979] text-base">
                  Admin:{item.adminName}
                </h5>
                <h3 className="font-poppins font-bold text-lg">
                  {item.groupName}
                </h3>
                <h5 className="font-poppins font-medium text-[#797979] text-sm">
                  {item.groupTag}
                </h5>
              </div>
            </div>

            <div className="ml-14 mt-3 flex flex-col">
              <button
                onClick={() => handleInfo(item)}
                className="font-poppins font-semibold text-xl text-white px-4 py-1 mb-1 rounded-md bg-primary"
              >
                Info
              </button>

              <button
                onClick={() => handleReqShow(item)}
                className="font-poppins font-semibold text-xl text-white px-2 py-1.5 rounded-md bg-green-600"
              >
                Requests
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyGroups;
