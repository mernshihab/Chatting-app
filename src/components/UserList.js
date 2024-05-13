import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AiFillMessage } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { useSelector } from "react-redux";

const UserList = () => {
  const db = getDatabase();
  let [userlist, setUserList] = useState([]);
  let [friendrequest, setFriendrequest] = useState([]);
  let [friend, setFriend] = useState([]);
  let data = useSelector((state) => state.userLoginInfo.userInfo);
  let [blocklist, setBlockList] = useState([]);
  let [filterUserList, setFilterUserList] = useState([]);

  let handleFriendRequest = (item) => {
    set(push(ref(db, "friendrequest")), {
      sendername: data.displayName,
      senderid: data.uid,
      senderPhoto: data.photoURL,
      recievername: item.username,
      recieverid: item.userid,
      recieverPhoto: item.profilePhoto,
    });
  };

  let handleSearch = (e) => {
    console.log(e.target.value);
    let arr = [];
    if (e.target.value.lengt === 0) {
      setFilterUserList([]);
    } else {
      userlist.filter((item) => {
        if (
          item.username.toLowerCase().includes(e.target.value.toLowerCase())
        ) {
          arr.push(item);
          setFilterUserList(arr);
        }
      });
    }
  };

  useEffect(() => {
    const userRef = ref(db, "users/");
    onValue(userRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        if (data.uid !== item.key) {
          arr.push({ ...item.val(), userid: item.key });
        }
      });
      setUserList(arr);
    });

    const friendrequestRef = ref(db, "friendrequest");
    onValue(friendrequestRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        arr.push(item.val().recieverid + item.val().senderid);
      });
      setFriendrequest(arr);
    });

    const friendRef = ref(db, "friend");
    onValue(friendRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        arr.push(item.val().recieverid + item.val().senderid);
      });
      setFriend(arr);
    });

    const blockRef = ref(db, "blocklist");
    onValue(blockRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        arr.push(item.val().blockbyid + item.val().blockid);
      });
      setBlockList(arr);
    });
  }, [data.uid, db]);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-solid border-black border-opacity-5 w-full py-3 px-6 pb-5 h-[463px] mr-10 overflow-y-scroll">
      <h3 className="font-poppins text-xl font-semibold">User List</h3>
      <div className="relative">
        <BsThreeDotsVertical className="text-lg text-primary absolute top-[-16px] right-[7px]" />
      </div>
      <div className="relative mt-3">
        <input
          onChange={handleSearch}
          className="w-full rounded-xl py-3 pl-16 outline-none shadow-sm border border-solid border-black border-opacity-5"
          type="text"
          placeholder="Search"
        />
        <FiSearch className="text-lg absolute top-1/3 left-[23px]" />
      </div>
      {filterUserList.length > 0
        ? filterUserList.map((item) => (
            <div className="flex mb-4 pt-5 after:w-[400px] after:h-px after:bottom-[-18px] after:left-1 after:content-[''] relative after:absolute after:bg-[#BFBFBF]">
              <img
                className="w-[70px] h-[70px] rounded-full mt-0.5"
                src={item.profilePhoto}
                alt="Profile pic"
              />
              <div className="pl-6 w-[190px] pt-1.5">
                <h3 className="font-poppins font-bold text-lg">
                  {item.username}
                </h3>
                <h5 className="font-poppins w-[210px] overflow-hidden hover:overflow-visible hover:font-bold hover:z-10 hover:rounded-xl duration-100 font-medium text-[#797979] text-sm">
                  {item.userid}
                </h5>
              </div>
              <div className="ml-7 mt-3">
                {friend.includes(item.userid + data.uid) ||
                friend.includes(data.uid + item.userid) ? (
                  <button className="font-poppins font-semibold text-xl bg-primary duration-200 text-white px-5 py-2 hover:py-2.5 hover:px-6 hover:mt-[-2px] rounded-xl hover:bg-themes ml-6">
                    <AiFillMessage />
                  </button>
                ) : friendrequest.includes(item.userid + data.uid) ||
                  friendrequest.includes(data.uid + item.userid) ? (
                  <button className="font-poppins font-semibold text-xl bg-gray-700 duration-100 text-white px-3 py-1.5 rounded-xl">
                    Pending
                  </button>
                ) : blocklist.includes(item.userid + data.uid) ||
                  blocklist.includes(data.uid + item.userid) ? (
                  <button className="font-poppins font-semibold text-xl bg-gray-700 duration-100 text-white px-4 py-1.5 rounded-xl">
                    Blocked
                  </button>
                ) : (
                  <button
                    onClick={() => handleFriendRequest(item)}
                    className="font-poppins font-semibold text-xl bg-green-600  duration-200 text-white px-6 py-1.5 hover:mt-[-2px] hover:py-2 hover:px-7 rounded-xl hover:shadow-lg ml-6"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          ))
        : userlist.map((item) => (
            <div className="flex mb-4 pt-5 after:w-[400px] after:h-px after:bottom-[-18px] after:left-1 after:content-[''] relative after:absolute after:bg-[#BFBFBF]">
              <img
                className="w-[70px] h-[70px] rounded-full mt-0.5"
                src={item.profilePhoto}
                alt="Profile pic"
              />
              <div className="pl-6 w-[190px] pt-1.5">
                <h3 className="font-poppins font-bold text-lg">
                  {item.username}
                </h3>
                <h5 className="font-poppins w-[210px] overflow-hidden hover:overflow-visible hover:font-bold hover:z-10 hover:rounded-xl duration-100 font-medium text-[#797979] text-sm">
                  {item.userid}
                </h5>
              </div>
              <div className="ml-7 mt-3">
                {friend.includes(item.userid + data.uid) ||
                friend.includes(data.uid + item.userid) ? (
                  <button className="font-poppins font-semibold text-xl bg-primary duration-200 text-white px-5 py-2 hover:py-2.5 hover:px-6 hover:mt-[-2px] rounded-xl hover:bg-themes ml-6">
                    <AiFillMessage />
                  </button>
                ) : friendrequest.includes(item.userid + data.uid) ||
                  friendrequest.includes(data.uid + item.userid) ? (
                  <button className="font-poppins font-semibold text-xl bg-gray-700 duration-100 text-white px-3 py-1.5 rounded-xl">
                    Pending
                  </button>
                ) : blocklist.includes(item.userid + data.uid) ||
                  blocklist.includes(data.uid + item.userid) ? (
                  <button className="font-poppins font-semibold text-xl bg-gray-700 duration-100 text-white px-4 py-1.5 rounded-xl">
                    Blocked
                  </button>
                ) : (
                  <button
                    onClick={() => handleFriendRequest(item)}
                    className="font-poppins font-semibold text-xl bg-green-600  duration-200 text-white px-6 py-1.5 hover:mt-[-2px] hover:py-2 hover:px-7 rounded-xl hover:shadow-lg ml-6"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          ))}
    </div>
  );
};

export default UserList;
