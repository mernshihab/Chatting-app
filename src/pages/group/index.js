import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Sidebar from "../../components/Sidebar";
import GroupList from "../../components/GroupList";
import MyGroups from "../../components/MyGroups";
import { useNavigate } from "react-router-dom";

const Group = () => {
  let navigate = useNavigate();
  let data = useSelector((state) => state.userLoginInfo.userInfo);

  useEffect(() => {
    if (!data) {
      navigate("/login");
    }
  }, []);
  return (
    <>
      {data && (
        <div className="flex  justify-evenly">
          <>
            <div className="w-[200px]">
              <Sidebar active="group" />
            </div>
            <div className="w-1/4 space-y-4">
              <GroupList />
              <MyGroups />
            </div>
            <div className="w-[1000px]">
              
            </div>
            
          </>
        </div>
      )}
    </>
  );
};

export default Group;
