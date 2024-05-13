import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BlockedUser from "../../components/BlockedUser";
import Friends from "../../components/Friends";
import FrirendRequest from "../../components/FrirendRequest";
import GroupList from "../../components/GroupList";
import MyGroups from "../../components/MyGroups";
import Search from "../../components/Search";
import Sidebar from "../../components/Sidebar";
import UserList from "../../components/UserList";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import userSlice, { userLoginInfo } from "../../slices/userSlice";

const Home = () => {
  const auth = getAuth();
  let navigate = useNavigate();
  let data = useSelector((state) => state.userLoginInfo.userInfo);
  let dispacth = useDispatch();

  onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
      dispacth(userLoginInfo(user));
      localStorage.setItem("userInfo", JSON.stringify(user));
    }
  });

  useEffect(() => {
    if (!data) {
      navigate("/login");
    }
  }, []);

  return (
    <>
      {data && (
        <div className="flex justify-evenly">
          {data.emailVerified ? (
            <>
              <div className="w-[200px]">
                <Sidebar active="home" />
              </div>
              <div className="w-1/4">
                <Search />
                <GroupList />
                <FrirendRequest />
              </div>
              <div className="w-1/4">
                <Friends />
                <MyGroups />
              </div>
              <div className="w-1/4">
                <UserList />
                <BlockedUser />
              </div>
            </>
          ) : (
            <div className="h-screen bg-primary w-full flex justify-center items-center">
              <div>
                <h3 className="w-full text-nunito text-bold text-5xl text-primary p-9 bg-white rounded-lg">
                  Please verify your Email
                </h3>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Home;
