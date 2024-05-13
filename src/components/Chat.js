import React, { useEffect, useState } from "react";
import {
  BsThreeDotsVertical,
  BsTriangleFill,
  BsFillCameraFill,
  BsSnapchat,
} from "react-icons/bs";
import { TbSend } from "react-icons/tb";
import { GrGallery } from "react-icons/gr";
import { AiFillAudio, AiFillCloseCircle } from "react-icons/ai";
import { MdEmojiEmotions } from "react-icons/md";
import { ImCross } from "react-icons/im";
import { FaStop } from "react-icons/fa";
import ModalImage from "react-modal-image";
import Camera, { FACING_MODES, IMAGE_TYPES } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";
import { useSelector } from "react-redux";
import moment from "moment/moment";
import { getDatabase, ref, set, push, onValue } from "firebase/database";
import {
  getStorage,
  ref as stref,
  uploadBytesResumable,
  getDownloadURL,
  uploadString,
  uploadBytes,
} from "firebase/storage";
import { ReactMediaRecorder } from "react-media-recorder";
import EmojiPicker from "emoji-picker-react";

const Chat = () => {
  const db = getDatabase();
  const storage = getStorage();

  let [check, setCheck] = useState(false);
  let [showEmoji, setShowEmoji] = useState(false);
  let [msg, setMsg] = useState("");
  let [msgList, setMsgList] = useState([]);
  let [gmsgList, setGmsgList] = useState([]);
  let [groupMemberList, setGroupMemberList] = useState([]);
  let [captureImage, setCaptureImage] = useState("");
  let [audioUrl, setAudioUrl] = useState("");
  let [blob, setBlob] = useState();
  let data = useSelector((state) => state.userLoginInfo.userInfo);
  let activeChatName = useSelector((state) => state.activeChat);

  let handleMsg = () => {
    if (activeChatName.active && activeChatName.active.status == "single") {
      set(push(ref(db, "singleMsg")), {
        msg: msg,
        whoSendId: data.uid,
        whoSendName: data.displayName,
        whoReceiveId: activeChatName.active.id,
        whoReceiveName: activeChatName.active.name,
        date: `${new Date().getFullYear()}-${
          new Date().getMonth() + 1
        }-${new Date().getDate()}  ${new Date().getHours()}:${new Date().getMinutes()}`,
      }).then(() => {
        setShowEmoji(false);
        setMsg("");
      });
    } else {
      set(push(ref(db, "groupMsg")), {
        msg: msg,
        whoSendId: data.uid,
        whoSendName: data.displayName,
        whoReceiveId: activeChatName.active.id,
        whoReceiveName: activeChatName.active.name,
        adminId: activeChatName.active.adminId,
        date: `${new Date().getFullYear()}-${
          new Date().getMonth() + 1
        }-${new Date().getDate()}  ${new Date().getHours()}:${new Date().getMinutes()}`,
      });
    }
  };

  let handleAudioSend = (mediaBlobUrl) => {
    console.log(mediaBlobUrl);
    const audioStorageRef = stref(storage, "audio/" + audioUrl);
    uploadBytes(audioStorageRef, audioUrl).then((snapshot) => {
      getDownloadURL(audioStorageRef).then((downloadURL) => {
        set(push(ref(db, "singleMsg")), {
          audio: downloadURL,
          whoSendId: data.uid,
          whoSendName: data.displayName,
          whoReceiveId: activeChatName.active.id,
          whoReceiveName: activeChatName.active.name,
          date: `${new Date().getFullYear()}-${
            new Date().getMonth() + 1
          }-${new Date().getDate()}  ${new Date().getHours()}:${new Date().getMinutes()}`,
        }).then(() => {
          setAudioUrl("");
        });
      });
    });
  };

  let handleImageUpload = (e) => {
    const storageRef = stref(storage, "chatImg/" + e.target.files[0].name);

    const uploadTask = uploadBytesResumable(storageRef, e.target.files[0]);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);
          set(push(ref(db, "singleMsg")), {
            img: downloadURL,
            whoSendId: data.uid,
            whoSendName: data.displayName,
            whoReceiveId: activeChatName.active.id,
            whoReceiveName: activeChatName.active.name,
            date: `${new Date().getFullYear()}-${
              new Date().getMonth() + 1
            }-${new Date().getDate()}  ${new Date().getHours()}:${new Date().getMinutes()}`,
          });
        });
      }
    );
  };

  let handleEmojiClick = (emoji) => {
    console.log(emoji.emoji);
    setMsg(msg + emoji.emoji);
  };

  function handleTakePhoto(dataUri) {
    setCaptureImage(dataUri);
    const storageRef = stref(storage, "some-child");

    uploadString(storageRef, dataUri, "data_url").then((snapshot) => {
      getDownloadURL(storageRef).then((downloadURL) => {
        set(push(ref(db, "singleMsg")), {
          img: downloadURL,
          whoSendId: data.uid,
          whoSendName: data.displayName,
          whoReceiveId: activeChatName.active.id,
          whoReceiveName: activeChatName.active.name,
          date: `${new Date().getFullYear()}-${
            new Date().getMonth() + 1
          }-${new Date().getDate()}  ${new Date().getHours()}:${new Date().getMinutes()}`,
        }).then(() => {
          setCheck(false);
        });
      });
    });
  }

  useEffect(() => {
    onValue(ref(db, "singleMsg"), (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        if (
          (item.val().whoSendId == data.uid &&
            item.val().whoReceiveId == activeChatName.active.id) ||
          (item.val().whoReceiveId == data.uid &&
            item.val().whoSendId == activeChatName.active.id)
        ) {
          arr.push(item.val());
        }
      });
      setMsgList(arr);
    });
  }, [activeChatName.active && activeChatName.active.id]);

  // groupMsg

  useEffect(() => {
    onValue(ref(db, "groupMsg"), (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        arr.push(item.val());
      });
      setGmsgList(arr);
    });
  }, [activeChatName.active && activeChatName.active.id]);

  useEffect(() => {
    onValue(ref(db, "groupMember"), (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        arr.push(item.val().groupId + item.val().memberId);
      });
      console.log("ami memberlist",arr);
      setGroupMemberList(arr);
    });
  }, []);

  return (
    <div className="bg-white shadow-lg px-12 py-6 rounded-xl">
      <div className="flex items-center justify-between border-b border-solid border-gray-300 pb-6 w-full">
        <div className="flex items-center gap-x-8">
          <div className="w-20 h-20 rounded-full shadow-lg relative">
            <img
              className="w-20 h-20 rounded-full"
              src={activeChatName.active && activeChatName.active.photo}
              alt="Active Photo"
            />
            <div className="w-4 h-4 rounded-full bg-green-500 ring-2 absolute bottom-2 right-0"></div>
          </div>
          <div>
            <h3 className="font-poppins font-semibold text-2xl">
              {activeChatName.active && activeChatName.active.name}
            </h3>
            <p className="font-poppins font-regular text-sm">Online</p>
          </div>
        </div>
        <div className="">
          <BsThreeDotsVertical className="text-2xl" />
        </div>
      </div>
      <div className="pt-7 overflow-y-auto px-2 h-[700px] border-b border-solid border-slate-200">
        {activeChatName.active && activeChatName.active.status == "single" ? (
          msgList.map((item) =>
            item.whoSendId == data.uid
              ? item.whoReceiveId == activeChatName.active.id &&
                (item.msg ? (
                  <div className="mb-8 text-right group ">
                    <div className="bg-primary inline-block py-3 px-7 rounded-md relative">
                      <p className="font-poppins font-medium text-base text-white max-w-lg overflow-hidden break-words text-start">
                        {item.msg}
                      </p>
                      <BsTriangleFill className="text-primary absolute bottom-[-1px] -right-2 text-2xl" />
                      <p className="font-poppins font-medium text-xs opacity-50 absolute -left-20 top-1/3 hidden group-hover:block">
                        {moment(item.date).format("DD-MM-YYYY")}
                      </p>
                    </div>
                    <p className="font-poppins font-medium text-xs opacity-50 mt-1">
                      {moment(item.date).format("ddd, h:mma")}
                    </p>
                  </div>
                ) : item.img ? (
                  <div className="mb-8 text-right group">
                    <div className="bg-primary inline-block p-3 w-72 rounded-md relative">
                      <ModalImage small={item.img} large={item.img} />
                      <BsTriangleFill className="text-primary absolute bottom-[-1px] -right-2 text-2xl" />
                      <p className="font-poppins font-medium text-xs opacity-50 absolute -left-20 top-1/2 hidden group-hover:block">
                        {moment(item.date).format("DD-MM-YYYY")}
                      </p>
                    </div>
                    <p className="font-poppins font-medium text-xs opacity-50 mt-1">
                      {moment(item.date).format("ddd, h:mma")}
                    </p>
                  </div>
                ) : (
                  <div className="mb-8 text-right ">
                    <div className="inline-block">
                      <audio src={item.audio} controls></audio>
                    </div>
                    <p className="font-poppins font-medium text-xs opacity-50 mt-1">
                      Today, 2:01pm
                    </p>
                  </div>
                ))
              : item.whoSendId == activeChatName.active.id &&
                (item.msg ? (
                  <div className="mb-8 group">
                    <div className="bg-slate-200 inline-block py-3 px-7 rounded-md relative">
                      <p className="font-poppins font-medium text-base text-black max-w-lg overflow-hidden break-words">
                        {item.msg}
                      </p>
                      <BsTriangleFill className="text-slate-200 absolute bottom-[-1px] -left-2 text-2xl" />
                      <p className="font-poppins font-medium text-xs opacity-50 absolute -right-20 top-1/3 hidden group-hover:block">
                        {moment(item.date).format("DD-MM-YYYY")}
                      </p>
                    </div>
                    <p className="font-poppins font-medium text-xs opacity-50 mt-1">
                      {moment(item.date).format("ddd, h:mma")}
                    </p>
                  </div>
                ) : item.img ? (
                  <div className="mb-8 group">
                    <div className="bg-slate-200 inline-block p-3 w-72 rounded-md relative">
                      <ModalImage small={item.img} large={item.img} />
                      <BsTriangleFill className="text-slate-200 absolute bottom-[-1px] -left-2 text-2xl" />
                      <p className="font-poppins font-medium text-xs opacity-50 absolute -right-20 top-1/2 hidden group-hover:block">
                        {moment(item.date).format("DD-MM-YYYY")}
                      </p>
                    </div>
                    <p className="font-poppins font-medium text-xs opacity-50 mt-1">
                      {moment(item.date).format("ddd, h:mma")}
                    </p>
                  </div>
                ) : (
                  <div className="mb-8 ">
                    <div className="inline-block">
                      <audio src={item.audio} controls></audio>
                    </div>
                    <p className="font-poppins font-medium text-xs opacity-50 mt-1">
                      Today, 2:01pm
                    </p>
                  </div>
                ))
          )
        ) :  activeChatName.active && activeChatName.active.adminId == data.uid  ||
          groupMemberList.includes(activeChatName.active && activeChatName.active.id + data.uid) ? (
          gmsgList.map((item) =>
            item.whoSendId == data.uid
              ? item.whoReceiveId == activeChatName.active.id && (
                  <div className="mb-8 text-right group ">
                    <div className="bg-primary inline-block py-3 px-7 rounded-md relative">
                      <p className="font-poppins font-medium text-base text-white max-w-lg overflow-hidden break-words text-start">
                        {item.msg}
                      </p>
                      <BsTriangleFill className="text-primary absolute bottom-[-1px] -right-2 text-2xl" />
                      <p className="font-poppins font-medium text-xs opacity-50 absolute -left-20 top-1/3 hidden group-hover:block">
                        {moment(item.date).format("DD-MM-YYYY")}
                      </p>
                    </div>
                    <p className="font-poppins font-medium text-xs opacity-50 mt-1">
                      {moment(item.date).format("ddd, h:mma")}
                    </p>
                  </div>
                )
              : item.whoReceiveId == activeChatName.active.id && (
                  <div className="mb-8 group">
                    <div className="bg-slate-200 inline-block py-3 px-7 rounded-md relative">
                      <p className="font-poppins font-medium text-base text-black max-w-lg overflow-hidden break-words">
                        {item.msg}
                      </p>
                      <BsTriangleFill className="text-slate-200 absolute bottom-[-1px] -left-2 text-2xl" />
                      <p className="font-poppins font-medium text-xs opacity-50 absolute -right-20 top-1/3 hidden group-hover:block">
                        {moment(item.date).format("DD-MM-YYYY")}
                      </p>
                    </div>
                    <p className="font-poppins font-medium text-xs opacity-50 mt-1">
                      {moment(item.date).format("ddd, h:mma")}
                    </p>
                  </div>
                )
          )
        ) : (
          <h1>you are not a member of this group</h1>
        )}
        {/* recieve message start */}
        {/* <div className="mb-8">
          <div className="bg-slate-200 inline-block py-3 px-9 rounded-md relative">
            <p className="font-poppins font-medium text-base text-black">
              Hi there!
            </p>
            <BsTriangleFill className="text-slate-200 absolute bottom-[-1px] -left-2 text-2xl" />
          </div>
          <p className="font-poppins font-medium text-xs opacity-50 mt-1">
            Today, 2:01pm
          </p>
        </div> */}
        {/* recieve message end */}

        {/* send message start */}
        {/* <div className="mb-8 text-right">
          <div className="bg-primary inline-block py-3 px-9 rounded-md relative">
            <p className="font-poppins font-medium text-base text-white">
              Hi there!
            </p>
            <BsTriangleFill className="text-primary absolute bottom-[-1px] -right-2 text-2xl" />
          </div>
          <p className="font-poppins font-medium text-xs opacity-50 mt-1">
            Today, 2:01pm
          </p>
        </div> */}
        {/* send message end */}

        {/* send message start */}
        {/* <div className="mb-8 text-right w-">
          <div className="bg-primary inline-block py-3 px-9 rounded-md relative">
            <p className="font-poppins font-medium text-base text-white text-start">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of
              Lorem Ipsum.
            </p>
            <BsTriangleFill className="text-primary absolute bottom-[-1px] -right-2 text-2xl" />
          </div>
          <p className="font-poppins font-medium text-xs opacity-50 mt-1">
            Today, 2:01pm
          </p>
        </div> */}
        {/* send message end */}

        {/* recieve message start */}
        {/* <div className="mb-8">
          <div className="bg-slate-200 inline-block py-3 px-9 rounded-md relative">
            <p className="font-poppins font-medium text-base text-black">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of
              Lorem Ipsum.
            </p>
            <BsTriangleFill className="text-slate-200 absolute bottom-[-1px] -left-2 text-2xl" />
          </div>
          <p className="font-poppins font-medium text-xs opacity-50 mt-1">
            Today, 2:01pm
          </p>
        </div> */}
        {/* recieve message end */}

        {/* send img start */}
        {/* <div className="mb-8 text-right ">
          <div className="bg-primary inline-block p-3 w-72 rounded-md relative">
            <ModalImage
              small={"images/reg-img.png"}
              large={"images/reg-img.png"}
            />
            <BsTriangleFill className="text-primary absolute bottom-[-1px] -right-2 text-2xl" />
          </div>
          <p className="font-poppins font-medium text-xs opacity-50 mt-1">
            Today, 2:01pm
          </p>
        </div> */}
        {/* send img end */}

        {/* recieve img start */}
        {/* <div className="mb-8 ">
          <div className="bg-slate-200 inline-block p-3 w-72 rounded-md relative">
            <ModalImage
              small={"images/groupimg.png"}
              large={"images/groupimg.png"}
            />
            <BsTriangleFill className="text-slate-200 absolute bottom-[-1px] -left-2 text-2xl" />
          </div>
          <p className="font-poppins font-medium text-xs opacity-50 mt-1">
            Today, 2:01pm
          </p>
        </div> */}
        {/* recieve img end */}

        {/* send audio start */}
        {/* <div className="mb-8 text-right ">
          <div className="inline-block">
            <audio controls></audio>
          </div>
          <p className="font-poppins font-medium text-xs opacity-50 mt-1">
            Today, 2:01pm
          </p>
        </div> */}
        {/* send audio end */}

        {/* recieve audio start */}
        {/* <div className="mb-8 ">
          <div className="inline-block">
            <audio controls></audio>
          </div>
          <p className="font-poppins font-medium text-xs opacity-50 mt-1">
            Today, 2:01pm
          </p>
        </div> */}
        {/* recieve audio end */}

        {/* send video start */}
        {/* <div className="mb-8 text-right ">
          <div className="bg-primary inline-block p-3 rounded-md">
            <video controls></video>
          </div>
          <p className="font-poppins font-medium text-xs opacity-50 mt-1">
            Today, 2:01pm
          </p>
        </div> */}
        {/* send video end */}

        {/* recieve video start */}
        {/* <div className="mb-8 ">
          <div className="inline-block bg-slate-200 p-3 rounded-md">
            <video controls></video>
          </div>
          <p className="font-poppins font-medium text-xs opacity-50 mt-1">
            Today, 2:01pm
          </p>
        </div> */}
        {/* recieve video end */}
        {/* <div>
          <div className="p-4 bg-red-500 ">
            <h1 className="font-opensans font-bold text-2xl text-primary">Upload Your Photo</h1>
            <input />
            
          </div>
        </div> */}
        {showEmoji && (
          <div className="absolute bottom-24 right-28">
            <EmojiPicker onEmojiClick={(emoji) => handleEmojiClick(emoji)} />
          </div>
        )}
      </div>
      {activeChatName && activeChatName.active.adminId === data.uid ||
        (groupMemberList.includes(activeChatName.active.id + data.uid) && (
          <div className="flex mt-5">
            <div className="relative flex w-[90%]">
              <input
                onChange={(e) => setMsg(e.target.value)}
                className="bg-slate-100 p-4 w-full rounded-lg shadow-sm border"
                value={msg}
              />
              <label>
                <input
                  onChange={handleImageUpload}
                  className="hidden"
                  type="file"
                />
                <GrGallery className="absolute right-5 bottom-1/4 text-2xl" />
              </label>
              <BsFillCameraFill
                onClick={() => setCheck(!check)}
                className="absolute right-14 bottom-1/4 text-2xl"
              />
              <ReactMediaRecorder
                audio
                onStop={(mediaBlobUrl) => {
                  setAudioUrl(mediaBlobUrl);
                }}
                render={({
                  status,
                  startRecording,
                  stopRecording,
                  mediaBlobUrl,
                }) => (
                  <div>
                    <p
                      className={`bg-red-500 font-opensans font-semibold text-white py-1 px-2 rounded-md absolute -top-5 right-14 ${
                        status == "idle" && "hidden"
                      } ${status == "stopped" && "hidden"}`}
                    >
                      {status}
                    </p>
                    {status == "recording" ? (
                      <button onClick={stopRecording}>
                        <FaStop
                          title="Stop Recording"
                          className="absolute right-[90px] bottom-1/4 mb-[2px] text-xl"
                        />
                      </button>
                    ) : (
                      <button onClick={startRecording}>
                        <AiFillAudio
                          title="Start Recording"
                          className="absolute right-[90px] bottom-1/4 text-2xl"
                        />
                      </button>
                    )}
                    {audioUrl && (
                      <button
                        onClick={() => handleAudioSend(mediaBlobUrl)}
                        className="absolute bg-green-500 py-[5px] px-3 font-poppins font-semibold text-sm rounded-md -top-4 right-12"
                      >
                        Send Audio
                      </button>
                    )}
                  </div>
                )}
              />
              <MdEmojiEmotions
                onClick={() => setShowEmoji(!showEmoji)}
                className="absolute right-[120px] bottom-1/4 text-2xl"
              />
            </div>
            {check && (
              <div className="w-full h-screen absolute top-0 left-0 bg-[rgba(0,0,0,.8)] z-50 flex justify-center items-center">
                <Camera
                  onTakePhoto={(dataUri) => {
                    handleTakePhoto(dataUri);
                  }}
                  idealFacingMode={FACING_MODES.ENVIRONMENT}
                  idealResolution={{ width: 640, height: 480 }}
                  imageType={IMAGE_TYPES.JPG}
                  imageCompression={0.97}
                  isMaxResolution={true}
                  isImageMirror={false}
                  isSilentMode={false}
                  isDisplayStartCameraError={true}
                  isFullscreen={false}
                  sizeFactor={1}
                />
                <AiFillCloseCircle
                  title="Close"
                  onClick={() => setCheck(!check)}
                  className="text-white text-4xl ml-3"
                />
              </div>
            )}
            <button
              onClick={handleMsg}
              title="Send"
              className="ml-5 bg-primary px-4 rounded-xl"
            >
              <TbSend className="text-3xl text-white" />
            </button>
          </div>
        ))}
    </div>
  );
};

export default Chat;
