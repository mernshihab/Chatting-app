import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { useSelector } from "react-redux";
import {
  getStorage,
  ref as stref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const GroupList = () => {
  const storage = getStorage();
  const db = getDatabase();
  const data = useSelector((state) => state.userLoginInfo.userInfo);
  const [show, setShow] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupTag, setGroupTag] = useState("");
  const [groupImg, setGroupImg] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupPending, setGroupPending] = useState([]);

  const handleGroupCreateButton = () => {
    setShow(!show);
  };

  const handleCreateGroup = async () => {
    try {
      if (groupName && groupTag) {
        const imageURL = await handleGroupImg(groupImg);
        await set(push(ref(db, "group")), {
          groupName: groupName,
          groupTag: groupTag,
          groupImg: imageURL && imageURL,
          adminId: data.uid,
          adminName: data.displayName,
          adminPhoto: data.photoURL,
        });
        setShow(false);
      } else {
        console.error("Group name, group tag, and image are required.");
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleGroupImg = (imageFile) => {
    return new Promise((resolve, reject) => {
      const storageRef = stref(storage, `groupImg/${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

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

  useEffect(() => {
    const groupRef = ref(db, "group");
    onValue(groupRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        if (data.uid !== item.val().adminId) {
          arr.push({ ...item.val(), key: item.key });
        }
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
    <div className="bg-white rounded-3xl border border-solid border-black border-opacity-5 shadow-xl w-full py-3 mt-11 px-6 pb-5 h-[360px] overflow-y-scroll">
      <div className="flex justify-between mb-5">
        <h3 className="font-poppins text-xl font-semibold">Group List</h3>
        <button
          onClick={handleGroupCreateButton}
          className="font-poppins font-semibold text-base text-white px-3 py-1 rounded-md bg-primary"
        >
          {show ? "Back" : "Create Group"}
        </button>
      </div>
      {show ? (
        <div>
          <input
            className="border-2 w-full outline-none rounded-lg py-3 px-2 placeholder:font-poppins font-poppins font-semibold mb-5"
            placeholder="Group Name"
            maxLength={15}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <input
            className="border-2 w-full outline-none rounded-lg py-3 px-2 placeholder:font-poppins font-poppins font-semibold mb-5"
            placeholder="Group Tag"
            maxLength={15}
            onChange={(e) => setGroupTag(e.target.value)}
          />
          {/* <input type="file" className="bg-red-500" onChange={(e) => setGroupImg(e.target.files[0])} /> */}
          <div className="relative">
            <input
              type="file"
              onChange={(e) => setGroupImg(e.target.files[0])}
              className="sr-only"
              id="groupImage"
            />
            <label
              htmlFor="groupImage"
              className="cursor-pointer border-2 border-dashed border-gray-500 py-1.5 px-4 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition duration-300"
            >
                {groupImg ? groupImg.name : "Group Image"}
            </label>
          </div>
          <button
            onClick={handleCreateGroup}
            className="w-full rounded-lg bg-green-500 text-white font-poppins font-semibold text-base hover:text-lg hover:mt-4 hover:drop-shadow-lg duration-300 mt-4 py-3"
          >
            Create Group
          </button>
        </div>
      ) : (
        <>
          {groups.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <h1 className="font-nunito font-bold text-xl text-black">
                No groups available
              </h1>
            </div>
          ) : (
            groups.map((item) => (
              <div
                key={item.key}
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
                    </h3>
                    <h5 className="font-poppins font-medium text-[#797979] text-sm">
                      {item.groupTag}
                    </h5>
                  </div>
                </div>
                <div className="mr-1 mt-4">
                  {groupPending.includes(item.key + data.uid) ||
                  groupPending.includes(data.uid + item.key) ? (
                    <button className="font-poppins font-semibold text-xl text-white px-3 py-1 rounded-md bg-red-600">
                      Pending
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGroupRequest(item)}
                      className="font-poppins font-semibold text-xl text-white px-6 py-1 rounded-md bg-green-600"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default GroupList;
